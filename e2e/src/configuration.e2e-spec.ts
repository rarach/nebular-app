import { browser, by, element, protractor } from 'protractor';


describe('Configuration page', () => {

    it('should display title "Nebular - Configuration"', () => {
        browser.get('/configuration');
        expect(browser.getTitle()).toBe('Nebular - Configuration');
    });

    it("finds and adds two new custom assets (USD anchors)", async() => {
        //Actual page being tested
        browser.get("/configuration");

        //Fill the asset input with "USD"
        const assetCodeInput = element(by.css("input#newAssetCode"));
        assetCodeInput.sendKeys("USD");

        //NOTE: black magic to make it work with async HTTP requests (+ timeout increased due to unreachable stellar.toml)
        browser.driver.manage().timeouts().setScriptTimeout(60000);
        element(by.css("button#findAssetCodeBtn")).click();

        const resultsTable = element(by.css("table#foundAssetsTable"));
        browser.wait(protractor.ExpectedConditions.presenceOf(resultsTable), 5000, "List of USD anchors failed to show in 5sec");

        //Check for most common USD anchors
        const anchorRow1 = resultsTable.element(by.css("tr#USD-GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX"));
        expect(anchorRow1.getText()).toBe("USD-www.anchorusd.com Add");
        const anchorImage1 = anchorRow1.element(by.css("img.asset-icon"));
        const anchorRow2 = resultsTable.element(by.css("tr#USD-GDSRCV5VTM3U7Y3L6DFRP3PEGBNQMGOWSRTGSBWX6Z3H6C7JHRI4XFJP"));
        expect(anchorRow2.getText()).toBe("USD-x.token.io Add");
        const anchorImage2 = anchorRow2.element(by.css("img.asset-icon"));

        browser.wait(() => {
            return anchorImage1.getAttribute("src").then((value) => { return value.indexOf("anchorusd.com") > -1; }),
            5000
        });
        expect(anchorImage1.getAttribute("src")).toContain("anchorusd.com");    //They wouldn't outsource the icons, right?
        expect(anchorImage2.getAttribute("src")).toContain("x.token.io");

        //Verify that the two USD anchors are not among user's custom assets already
        const assetsTable = element(by.css("table#customAssetsTable"));
        expect(assetsTable.element(by.css("tr#USD-GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX")).isPresent()).toBe(false); //anchorusd.com
        expect(assetsTable.element(by.css("tr#USD-GDSRCV5VTM3U7Y3L6DFRP3PEGBNQMGOWSRTGSBWX6Z3H6C7JHRI4XFJP")).isPresent()).toBe(false); //x.token.io

        const addButton1 = anchorRow1.element(by.css("button.addButton"));
        addButton1.click();
        //Verify it's been removed from the first list and added to the second
        expect(anchorRow1.isPresent()).toBe(false);
        expect(assetsTable.element(by.css("tr#USD-GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX")).isPresent()).toBe(true);

        const addButton2 = anchorRow2.element(by.css("button.addButton"));
        addButton2.click();
        //Removed from available, added among stored
        expect(anchorRow2.isPresent()).toBe(false);
        expect(assetsTable.element(by.css("tr#USD-GDSRCV5VTM3U7Y3L6DFRP3PEGBNQMGOWSRTGSBWX6Z3H6C7JHRI4XFJP")).isPresent()).toBe(true);
    }, 60000);

    it("contains list of custom assets saved by user", () => {     //TODO: "... and removes one of them"
        //Trick: go to invalid page to load the web without calling the dependent services
        browser.get("/no-such-page");
        browser.manage().addCookie({
            name: "ass",
            value: "RUB|GUBERNIA2929292929292929|noSuch.ru|https://noSuch.ru/rub.ico,"+
                   "UHH|GBEDEDEDEDE|GBE...DEDEDE|,"+
                   "BTC|GBSTRONGHODL455519K7YY|GBSTR...K7YY|null,"+
                   "zzzzz|GCCP|example.org|./assets/images/asset_icons/unknown.png"
        });
        browser.get("/configuration");

        const assetRows = element.all(by.css("tr.asset-item"));
        expect(assetRows.count()).toBe(4);
        expect(assetRows.get(0).getText()).toBe("RUB-noSuch.ru Remove");
        expect(assetRows.get(1).getText()).toBe("UHH-GBE...DEDEDE Remove");
        expect(assetRows.get(2).getText()).toBe("BTC-GBSTR...K7YY Remove");
        expect(assetRows.get(3).getText()).toBe("zzzzz-example.org Remove");
    });
});
