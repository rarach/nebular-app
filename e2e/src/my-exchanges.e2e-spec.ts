import { browser, by, element } from 'protractor';

describe('My Exchanges', () => {
    it('should display title "My Exchanges"', () => {
        browser.get('/myExchanges');
        expect(browser.getTitle()).toBe('My Exchanges');
    });

    it('should always show the (add) button', () => {
        browser.get('/myExchanges');
        const addLink = element.all(by.css("div.exchange-link"));
        expect(addLink.count()).toBe(1);
        expect(addLink.get(0).getText()).toBe("(add)");
    });

    fit("show 3 exchanges saved by a user, remove one", () => {
        //Trick: go to invalid page to load the web without calling the dependent services
        browser.get("/no-such-page");
        browser.manage().addCookie({
            name: "ass",
            value: "XCN|GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY|fchain.io|,"+
                   "HKDT|GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ|mover.scam|null"
        });
        browser.manage().addCookie({
            name: "exc",
            value: "1234567#" +
                   "BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH/" +        //BTC-NaoBTC
                   "BTC-GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF" +         //BTC-apay.io
                   ",333000444#" +
                   "XLM/EURT-GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S" +    //Euro
                   ",88888888#" +
                   "XCN-GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY/" +        //CNY by fchain.io
                   "HKDT-GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ"
        });
        //Actual page being tested
        browser.get("/myExchanges");

        const exchangeLinks = element.all(by.css("div.exchange-link"));
        expect(exchangeLinks.count()).toBe(1 + 3);   //+1 for the trailing (add) button

        //Exchange 1
        let dropDowns = element.all(by.css("div#customExchange1234567 mat-select.selectedAssetOption"));
        expect(dropDowns.get(0).getAttribute("title")).toBe("Bitcoin");
        expect(dropDowns.get(0).getText()).toBe("BTC-naobtc.com");
        expect(dropDowns.get(1).getAttribute("title")).toBe("Bitcoin");
        expect(dropDowns.get(1).getText()).toBe("BTC-apay.io");

        //Exchange 2
        dropDowns = element.all(by.css("div#customExchange333000444 mat-select.selectedAssetOption"));
        expect(dropDowns.get(0).getAttribute("title")).toBe("Lumen");
        expect(dropDowns.get(0).getText()).toBe("XLM");
        expect(dropDowns.get(1).getAttribute("title")).toBe("Euro");
        expect(dropDowns.get(1).getText()).toBe("EURT-tempo.eu.com");

        //Exchange 3
        dropDowns = element.all(by.css("div#customExchange88888888 mat-select.selectedAssetOption"));
        expect(dropDowns.get(0).getAttribute("title")).toBe("XCN");
        expect(dropDowns.get(0).getText()).toBe("XCN-fchain.io");
        expect(dropDowns.get(1).getAttribute("title")).toBe("HKDT");
        expect(dropDowns.get(1).getText()).toBe("HKDT-mover.scam");

        //Hover over the 2nd exchange to make the (X) icon appear, then click it
        browser.actions().mouseMove(element(by.css("div#customExchange333000444"))).perform();
        const xIcon = element(by.css("div#customExchange333000444 div.removeExchButton"));
        expect(xIcon.isDisplayed()).toBeTruthy();
        xIcon.click();
        expect(element.all(by.css("div.customExchange")).count()).toBe(2);
    });

    it("TODO: adding new custom exchange saves it in cookie", () => {
        //TODO: add 2 exchanges, refresh page, verify cookie
    });
});