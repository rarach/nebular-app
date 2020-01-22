import { TestBed, inject } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie';

import { AssetService } from './asset.service';
import { Account, KnownAccounts } from '../model/account.model';
import { Asset, KnownAssets } from '../model/asset.model';
import { ExchangePair } from '../model/exchange-pair.model';


describe('AssetService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ {
                provide: CookieService,
                useValue: {
                    get: (key) => ""    //Always return empty cookie
                }
            } ]
        });
    });

    it('should be instantiated', inject([CookieService], (cookieService) => {
        const assetService = new AssetService(cookieService);
        expect(assetService).not.toBeNull();
        expect(assetService.customAssets.length).toBe(0);
    }));
});

describe('AssetService', () => {
    let assetService: AssetService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: CookieService, useClass: CookieServiceStub }]
        });
        const cookieService = TestBed.get(CookieService);
        assetService = new AssetService(cookieService);
    });

    it('should load custom assets and exchanges', () => {
        const acc = new Account("GGGGGGGGaposdyuhfjkasndfm8415", "GGGGGGGGaposdyuh...");
        acc.domain = null;
        expect(assetService.customAssets).toEqual([
            new Asset("ABC", "ABC", null, new Account("G0101010101010101", "google.com"), "https://google.com/dog.png"),
            new Asset("abcdef", "abcdef", "credit_alphanum12", acc, "asdf://vilence.jpg"),
            new Asset("btC", "btC", null, new Account("GGGGGGK", "example.com"), "./assets/images/asset_icons/unknown.png"),
            new Asset("CNY", "CNY", "credit_alphanum4",
                      new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "ripplefox.com"),
                      "ripplefox.com/cny.png"),
            new Asset("ZX0", "ZX0", 'credit_alphanum4',
                      new Account("GGGGGGK", "example.com"),
                      "./assets/images/asset_icons/unknown.png")
        ]);
        expect(assetService.customExchanges).toEqual([
            new ExchangePair("5555",
                             new Asset("USD", "USD", null, new Account("GAAAASLIMIT", "GAAAASLIMIT...")),
                             new Asset("XLM", "XLM", null, new Account(/*native*/null, null))),
            new ExchangePair("12345",
                             new Asset("lightcoin", "lightcoin", "credit_alphanum12", new Account("GIBRALTARRRRR458743551", "GIBRALTARRRRR458...")),
                             new Asset("XrP", "XrP", "credit_alphanum4", new Account("G0G0G0G0", "G0G0G0G0..."))),
            new ExchangePair("10101010",
                             new Asset("XLM", "XLM", "native", new Account(null, null), "./assets/images/asset_icons/XLM.png"),
                             new Asset("xlm", "xlm", null, new Account(null, null)))
        ]);
    });
    it("#getAssetCodesForExchange() ", () => {
        const codes = assetService.getAssetCodesForExchange();
        expect(codes).toEqual(["XLM", "BTC", "CNY", "ETH", "EURT", "MOBI", "RMT", "SLT", "ABC", "abcdef", "btC", "ZX0"]);
    });
    it("#getAllAnchors() returns common+custom anchors", () => {
        const issuers = assetService.getAllAnchors();
        expect(issuers.length).toBe(12);
        expect(issuers[0]).toEqual(new Account(null, null));
        expect(issuers[1]).toEqual(KnownAccounts.NaoBTC);
        expect(issuers[2]).toEqual(KnownAccounts.Papaya2);      //etc...
        expect(issuers).toContain(new Account("G0101010101010101", "google.com"));
        expect(issuers).toContain(new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "ripplefox.com"));
    });
    it("#GetIssuersByAssetCode('CNY') gives common+custom assets", () => {
        assetService.AddCustomAsset("CNY", "GBELS050505050505050505");
        const assets = assetService.GetIssuersByAssetCode("CNY");
        expect(assets).toEqual([
            KnownAccounts.RippleFox,
            new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "ripplefox.com"),
            new Account("GBELS050505050505050505", "GBELS05050505050...")
        ]);
    });
    it("#getFirstIssuerAddress('BTC') returns address of first BTC anchor", () => {
        expect(assetService.getFirstIssuerAddress("BTC")).toBe(/*naoBTC*/"GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH");
    });
    it("#getFirstIssuerAddress('NO_SUCH') returns null", () => {
        expect(assetService.getFirstIssuerAddress("NO_SUCH")).toBeNull();
    });
    it("#GetIssuerByAddress('GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX') returns 'RippleFox' Account", () => {
        const anchor = assetService.GetIssuerByAddress('GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX');
        expect(anchor.domain).toBe("ripplefox.com");
    });
    it("#GetIssuerByAddress('GBDDD_NOPE') returns null", () => {
        expect(assetService.GetIssuerByAddress("GBDDD_NOPE")).toBeNull();
    });
    it("#AddCustomAsset() gives NULL for duplicate entry and doesn't add it", () => {
        assetService.customAssets.push(new Asset("JPY", "Japanese yen", null, KnownAccounts.Mobius));
        expect(assetService.customAssets.length).toBe(6);
        expect(assetService.AddCustomAsset("JPY", "GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH")).toBeNull();
        expect(assetService.customAssets.length).toBe(6);
    });
    it("#AddCustomAsset() with known issuer", () => {
        expect(assetService.customAssets.length).toBe(5);
        const newAsset = assetService.AddCustomAsset("JPY", /*Mobius*/"GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH");
        expect(assetService.customAssets.length).toBe(6);
        expect(newAsset.code).toBe("JPY");
        expect(newAsset.fullName).toBe("JPY");
        expect(newAsset.type).toBe("credit_alphanum4");
        expect(newAsset.issuer).toBe(KnownAccounts.Mobius);
    });
    it("#AddCustomAsset() with unknown issuer", () => {
        expect(assetService.customAssets.length).toBe(5);
        const newAsset = assetService.AddCustomAsset("04", "GWYNETH");
        expect(assetService.customAssets.length).toBe(6);
        expect(newAsset.code).toBe("04");
        expect(newAsset.fullName).toBe("04");
        expect(newAsset.type).toBe("credit_alphanum4");
        expect(newAsset.issuer).toEqual(new Account("GWYNETH", "GWYNETH..."))
    });
    it("#RemoveCustomAsset() deletes custom asset", () => {
        assetService.customAssets.push(new Asset("TRY", "Turkish lyra", null, new Account("GOGODanceQQQ", "nebul.ar")));
        expect(assetService.customAssets.length).toBe(6);
        expect(assetService.RemoveCustomAsset("TRY", "GOGODanceQQQ")).toBe(true);
        expect(assetService.customAssets.length).toBe(5);
    });
    it("#RemoveCustomAsset() returns false and doesn't delete anything for missing asset", () => {
        expect(assetService.customAssets.length).toBe(5);
        expect(assetService.RemoveCustomAsset("TRY", "GOGODanceQQQ")).toBe(false);
        expect(assetService.customAssets.length).toBe(5);
    });
    it("#CreateCustomExchange() creates new XLM/XLM pair and adds to custom exchanges", () => {
        expect(assetService.customExchanges.length).toBe(3);
        const newPair = assetService.CreateCustomExchange();
        expect(assetService.customExchanges.length).toBe(4);
        expect(newPair.id).toBeTruthy();
        expect(newPair.baseAsset).toEqual(new Asset("XLM", "Lumen", "native", new Account(null, null)));
        expect(newPair.counterAsset.code).toBe("XLM");
    });

    it("#UpdateCustomExchange() updates existing pair", () => {
        //Sanity checks first
        expect(assetService.customExchanges.length).toBe(3);
        expect(assetService.customExchanges[1].baseAsset.issuer.address).toBe("GIBRALTARRRRR458743551");
        expect(assetService.customExchanges[1].counterAsset.code).toBe("XrP");
        const updatedExch = assetService.UpdateCustomExchange("12345", new Asset("MXN", "Mexican peso", null, new Account("GUPDATED", null)),
                                                                       new Asset("DDD", null, null, new Account("GBBBBBBBBBBBB", "hugo.boss")));
        expect(assetService.customExchanges.length).toBe(3);
        expect(updatedExch.id).toBe("12345");
        expect(updatedExch.baseAsset).toEqual(new Asset("MXN", "Mexican peso", null, new Account("GUPDATED", "GUPDATED...")));
        expect(updatedExch).toBe(assetService.customExchanges[1]);
        expect(updatedExch.counterAsset.code).toBe("DDD");
    });
    it("#UpdateCustomExchange() with bad exchange ID returns null", () => {
        expect(assetService.UpdateCustomExchange("0w645612a", new Asset("ABC", null, null, new Account("G012", null)), null)).toBeNull();
    });

    it("#RemoveCustomExchange() removes existing exchange pair", () => {
        expect(assetService.customExchanges.length).toBe(3);
        expect(assetService.RemoveCustomExchange("12345")).toBe(true);
        expect(assetService.customExchanges.length).toBe(2);
        expect(assetService.customExchanges).toContain(jasmine.objectContaining( { id : "5555"}));
        expect(assetService.customExchanges).not.toContain(jasmine.objectContaining( { id : "12345"}));
        expect(assetService.customExchanges).toContain(jasmine.objectContaining( { id : "10101010" }));
    });
    it("#RemoveCustomExchange() doesn't remove non-existing exchange pair", () => {
        expect(assetService.customExchanges.length).toBe(3);
        expect(assetService.RemoveCustomExchange("0968dt4uwe5a6074d0gsdf")).toBe(false);
        expect(assetService.customExchanges.length).toBe(3);
    });

    it("#SwapCustomExchanges() switches 2 custom markets", () => {
        //Sanity check before the swap
        expect(assetService.customExchanges.length).toBe(3);
        expect(assetService.customExchanges[0].id).toBe("5555");
        expect(assetService.customExchanges[1].id).toBe("12345");

        assetService.SwapCustomExchanges(assetService.customExchanges[1], assetService.customExchanges[0]);

        expect(assetService.customExchanges[0].id).toBe("12345");
        expect(assetService.customExchanges[0].baseAsset.code).toBe("lightcoin");
        expect(assetService.customExchanges[1].id).toBe("5555");
        expect(assetService.customExchanges[1].baseAsset.issuer.address).toBe("GAAAASLIMIT");
        expect(assetService.customExchanges[2].id).toBe("10101010");    //Must stay unchanged
    });

    it("#serializeToCookie() works", () => {
        assetService.customAssets.push(KnownAssets["USD-AnchorUsd"]);
        assetService.customExchanges.push(new ExchangePair("c00k1e",
                                                          new Asset("C00K", "Cookie token", "credit_alpanum4", new Account("G0141414", "asdf.org")),
                                                          KnownAssets["ETH-fchain"]));
        //Call one of the methods that internally call serializeToCookie()
        assetService.CreateCustomExchange();

        const cookieService = TestBed.get(CookieService);
        expect(cookieService.values["ass"]).toBe("ABC|G0101010101010101|google.com|https://google.com/dog.png,abcdef|GGGGGGGGaposdyuhfjkasndfm8415|null|asdf://vilence.jpg,btC|GGGGGGK|example.com|./assets/images/asset_icons/unknown.png,CNY|GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX|ripplefox.com|ripplefox.com/cny.png,ZX0|GGGGGGK|example.com|./assets/images/asset_icons/unknown.png,USD|GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX|anchorusd.com|./assets/images/asset_icons/unknown.png");
        expect(cookieService.values["exc"]).toMatch(/5555#USD-GAAAASLIMIT\/XLM,12345#lightcoin-GIBRALTARRRRR458743551\/XrP-G0G0G0G0,10101010#XLM\/xlm-null,c00k1e#C00K-G0141414\/ETH-GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIO2QZQ7IOZ4YC5XV3C2IKYU,\d{13}#XLM\/XLM/);
    });
});


class CookieServiceStub {
    get(key: string): string {
        if ("ass" === key) {
            return "ABC|G0101010101010101|google.com|https://google.com/dog.png, abcdef|GGGGGGGGaposdyuhfjkasndfm8415||asdf://vilence.jpg,btC|GGGGGGK|example.com|,CNY|GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX|ripplefox.com|ripplefox.com/cny.png,ZX0|GGGGGGK|example.com|";
        }
        if ("exc" === key) {
            return "5555#USD-GAAAASLIMIT/XLM,12345#lightcoin-GIBRALTARRRRR458743551/XrP-G0G0G0G0, 10101010#XLM/xlm";
        }
        else throw new Error("No test data ready for given inputs (cookie key = '" + key + "')");
    }

    values = new Array();
    put(key: string, value: string, options: any) {
        if ("ass" === key || "exc" === key) {
            this.values[key] = value;
            return;
        }

        throw `No test data ready for inputs key=${key}; value=${value}`;
    }
}
