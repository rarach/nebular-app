import { browser, by, element, protractor } from 'protractor';


describe('Configuration page', () => {

    afterEach(() => browser.waitForAngularEnabled(true));

    it('should display title "Nebular - Configuration" and cookie agreement prompt', () => {
        browser.get('/configuration');
        expect(browser.getTitle()).toBe('Nebular - Configuration');

        const cookieButton = element(by.css("button#agreeCookie"));
        cookieButton.click();

        const assetCodeInput = element(by.css("input#newAssetCode"));
        expect(assetCodeInput.isDisplayed()).toBe(true);
    });

    it("finds and adds two new custom assets (BTC anchors)", async() => {
        browser.waitForAngularEnabled(false);

        //Trick: go to invalid page to load the web without calling the dependent services, setup a cookie
        browser.get("/no-such-page");
        browser.manage().addCookie({ name: "agr", value: "true" });
        //Actual page being tested
        browser.get("/configuration");

        //Fill the asset input with "BTC"
        const assetCodeInput = element(by.css("input#newAssetCode"));
        assetCodeInput.sendKeys("BTC");

        //NOTE: black magic to make it work with async HTTP requests (+ timeout increased due to unreachable stellar.toml)
        browser.driver.manage().timeouts().setScriptTimeout(120000);
        element(by.css("button#findAssetCodeBtn")).click();

        const resultsTable = element(by.css("table#foundAssetsTable"));

        //Give some time to load and build elements
        browser.sleep(5000);
        browser.wait(protractor.ExpectedConditions.presenceOf(resultsTable), 5000, "List of BTC anchors failed to show in 5sec");

        //Check for most common BTC anchors
        const anchorRow1 = resultsTable.element(by.css("tr#BTC-GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF"));
        expect(anchorRow1.getText()).toBe("BTC-apay.io Add");
        const anchorImage1 = anchorRow1.element(by.css("img.asset-icon"));
        const anchorRow2 = resultsTable.element(by.css("tr#BTC-GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5"));
        expect(anchorRow2.getText()).toBe("BTC-stellarport.io Add");
        const anchorImage2 = anchorRow2.element(by.css("img.asset-icon"));

        expect(anchorImage1.getAttribute("src")).toContain("apay.io");    //They wouldn't outsource the icons, right?
        expect(anchorImage2.getAttribute("src")).toContain("stellarport.io");

        //Verify that the two BTC anchors are not among user's custom assets already
        const assetsTable = element(by.css("table#customAssetsTable"));
        expect(assetsTable.element(by.css("tr#BTC-GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF")).isPresent()).toBe(false); //apay.io
        expect(assetsTable.element(by.css("tr#BTC-GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5")).isPresent()).toBe(false); //stellarport.io

        const addButton1 = anchorRow1.element(by.css("button.addButton"));
        addButton1.click();
        //Verify it's been removed from the first list and added to the second
        expect(anchorRow1.isPresent()).toBe(false);
        expect(assetsTable.element(by.css("tr#BTC-GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF")).isPresent()).toBe(true);

        const addButton2 = anchorRow2.element(by.css("button.addButton"));
        addButton2.click();
        //Removed from available, added among stored
        expect(anchorRow2.isPresent()).toBe(false);
        expect(assetsTable.element(by.css("tr#BTC-GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5")).isPresent()).toBe(true);
    }, 120000);

    it("contains list of custom assets saved by user", () => {     //TODO: "... and removes one of them"
        //Trick: go to invalid page to load the web without calling the dependent services
        browser.get("/no-such-page");
        browser.manage().addCookie({ name: "agr", value: "true" });
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
