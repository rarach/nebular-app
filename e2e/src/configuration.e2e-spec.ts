//DEL import { async, TestBed } from '@angular/core/testing';
import { browser, by, element } from 'protractor';


describe('Configuration page', () => {
/*dEL    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AssetService, useClass: AssetServiceStub }
            ]
        })
        .compileComponents();
    }));
*/
    it('should display title "Nebular - Configuration"', () => {
        browser.get('/configuration');
        expect(browser.getTitle()).toBe('Nebular - Configuration');
    });
    it("Drop-down with asset codes contains all available codes", () => {
        //Trick: go to invalid page to load the web without calling the dependent services
        browser.get("/no-such-page");
        browser.manage().addCookie({
            name: "aco",
            value: "xyzCoin,PLZ,RUPEE,ZEC"
        });
        //Actual page being tested
        browser.get("/configuration");

        //With mat-select we need to open the drop-down fitst to have items markup there
        element(by.css(".selectedAssetCode")).click();

        const assetCodeOptions = element.all(by.css("mat-option"));
        expect(assetCodeOptions.count()).toBe(13 + 4);  //13 known (excluding XLM) + 4  from above cookie
        expect(assetCodeOptions.get(0).getText()).toBe("BTC");
        expect(assetCodeOptions.get(0).getWebElement().getAttribute("title")).toBe("Bitcoin");

        expect(assetCodeOptions.get(4).getText()).toBe("HKDT");
        expect(assetCodeOptions.get(4).getWebElement().getAttribute("title")).toBe("Hong Kong Dollar");
        expect(assetCodeOptions.get(13).getText()).toBe("xyzCoin");
        expect(assetCodeOptions.get(13).getWebElement().getAttribute("title")).toBe("xyzCoin (custom)");
        expect(assetCodeOptions.get(14).getText()).toBe("PLZ");
        expect(assetCodeOptions.get(14).getWebElement().getAttribute("title")).toBe("PLZ (custom)");
        expect(assetCodeOptions.get(16).getText()).toBe("ZEC");
        expect(assetCodeOptions.get(16).getWebElement().getAttribute("title")).toBe("ZEC (custom)");
    });
//TODO    it("Drop-down with anchors contains all available issuers", () => { todo })
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
