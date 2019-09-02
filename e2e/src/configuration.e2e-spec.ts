//DEL import { async, TestBed } from '@angular/core/testing';
import { browser, by, element, protractor } from 'protractor';


describe('Configuration page', () => {

    it('should display title "Nebular - Configuration"', () => {
        browser.get('/configuration');
        expect(browser.getTitle()).toBe('Nebular - Configuration');
    });
    it("finds all relevant anchors for asset code 'USD'", () => {
        //Actual page being tested
        browser.get("/configuration");

        //Fill the asset input with "USD"
        const assetCodeInput = element(by.css("input#newAssetCode"));
        assetCodeInput.sendKeys("USD");
        browser.ignoreSynchronization = true;
        element(by.css("button#findAssetCodeBtn")).click();

        const resultsTable = element(by.css("table#foundAssetsTable"));
        browser.wait(protractor.ExpectedConditions.presenceOf(resultsTable), 5000, "List of USD anchors failed to show in 5sec");

        //Check for most common USD anchors
        const anchorRow1 = resultsTable.element(by.css("tr#USD-GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX"));
        expect(anchorRow1.getText()).toBe("USD-www.anchorusd.com Add");
        const anchorImage1 = anchorRow1.element(by.css("img.asset-icon"));

        if (!browser.ignoreSynchronization) throw new Error("blah!!!");



/*TODO: this is a preferred style, but doesn't work here for some reason :-(
browser.wait(() => {
    return anchorImage1.getAttribute("src").then((value) => { return value.indexOf("anchorusd.com") > -1; }),
    5000
});
*/      browser.sleep(4000);
        expect(anchorImage1.getAttribute("src")).toContain("anchorusd.com");    //They wouldn't outsource the icon, right?



        browser.ignoreSynchronization = false;
    });

    it("Contains list of custom assets saved by user", () => {
        //Trick: go to invalid page to load the web without calling the dependent services
        browser.get("/no-such-page");
        browser.manage().addCookie({
            name: "ass",
            value: "RUB-GUBERNIA2929292929292929,UHH-GBEDEDEDEDE,BTC-GBSTRONGHODL455519K7YY,zzzzz-GCCP"
        });
        browser.get("/configuration");

        const assetRows = element.all(by.css("#customAssetsList div.customItemRow"));
        expect(assetRows.count()).toBe(4);
        expect(assetRows.get(0).getText()).toBe("RUB-GUBERNIA29292929... (GUBERNIA2929292929292929)\nremove");
        expect(assetRows.get(1).getText()).toBe("UHH-GBEDEDEDEDE... (GBEDEDEDEDE)\nremove");
        expect(assetRows.get(2).getText()).toBe("BTC-GBSTRONGHODL4555... (GBSTRONGHODL455519K7YY)\nremove");
        expect(assetRows.get(3).getText()).toBe("zzzzz-GCCP... (GCCP)\nremove");
    });
});
