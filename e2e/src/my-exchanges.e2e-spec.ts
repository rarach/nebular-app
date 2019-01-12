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

    it('should show 3 exchanges saved by a user"', () => {
        //Trick: go to invalid page to load the web without calling the dependent services
        browser.get("/no-such-page");
        browser.manage().addCookie({
            name: "exc",
            value: "1234567#" +
                   "BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH/" +        //BTC-NaoBTC
                   "BTC-GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG" +         //BTC-Stronghold
                   ",333000444#" +
                   "XLM/EURT-GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S" +    //Euro
                   ",88888888#" +
                   "XCN-GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY/" +        //CNY-fchain.io
                   "HKDT-GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ"          //HK dollar (CryptoMover)
        });
        //Actual page being tested
        browser.get("/myExchanges");

        const exchangeLinks = element.all(by.css("div.exchange-link"));
        expect(exchangeLinks.count()).toBe(1 + 3);   //+1 for the trailing (add) button

        //Exchange 1
        let dropDown = element.all(by.css("div#customExchange1234567 mat-select.selectedAssetCode")).first();
        expect(dropDown.getAttribute("title")).toBe("Bitcoin");
        expect(dropDown.getText()).toBe("BTC");

        dropDown = element.all(by.css("div#customExchange1234567 mat-form-field:nth-child(2)")).first();
        expect(dropDown.getAttribute("title")).toBe("NaoBTC");
        expect(dropDown.getText()).toBe("naobtc.com");

        dropDown = element.all(by.css("div#customExchange1234567 mat-form-field:nth-child(3) mat-select.selectedAssetCode")).first();
        expect(dropDown.getAttribute("title")).toBe("Bitcoin");
        expect(dropDown.getText()).toBe("BTC");

        dropDown = element.all(by.css("div#customExchange1234567 mat-form-field:nth-child(4)")).first();
        expect(dropDown.getAttribute("title")).toBe("Stronghold");
        expect(dropDown.getText()).toBe("stronghold.co");

        //Exchange 2
        dropDown = element.all(by.css("div#customExchange333000444 mat-select.selectedAssetCode")).first();
        expect(dropDown.getAttribute("title")).toBe("Lumen");
        expect(dropDown.getText()).toBe("XLM");

        dropDown = element.all(by.css("div#customExchange333000444 mat-form-field:nth-child(2)")).first();
        expect(dropDown.getAttribute("title")).toBe("(native)");
        expect(dropDown.getText()).toBe("(native)");

        dropDown = element.all(by.css("div#customExchange333000444 mat-form-field:nth-child(3) mat-select.selectedAssetCode")).first();
        expect(dropDown.getAttribute("title")).toBe("Euro");
        expect(dropDown.getText()).toBe("EURT");

        dropDown = element.all(by.css("div#customExchange333000444 mat-form-field:nth-child(4)")).first();
        expect(dropDown.getAttribute("title")).toBe("Tempo");
        expect(dropDown.getText()).toBe("tempo.eu.com");

        //Exchange 3
        dropDown = element.all(by.css("div#customExchange88888888 mat-select.selectedAssetCode")).first();
        expect(dropDown.getAttribute("title")).toBe("XCN (custom)");
        expect(dropDown.getText()).toBe("XCN");

        dropDown = element.all(by.css("div#customExchange88888888 mat-form-field:nth-child(2)")).first();
        expect(dropDown.getAttribute("title")).toBe("GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY");
        expect(dropDown.getText()).toBe("GCNY5OXYSY...");

        dropDown = element.all(by.css("div#customExchange88888888 mat-form-field:nth-child(3) mat-select.selectedAssetCode")).first();
        expect(dropDown.getAttribute("title")).toBe("Hong Kong Dollar");
        expect(dropDown.getText()).toBe("HKDT");

        dropDown = element.all(by.css("div#customExchange88888888 mat-form-field:nth-child(4)")).first();
        expect(dropDown.getAttribute("title")).toBe("CryptoMover");
        expect(dropDown.getText()).toBe("cryptomover.com");
    });

    it("TODO: Clicking upper right (X) removes respective custom exchange", () => {
        //TODO: add 2 exchanges, remove the second one, verify
    });
});