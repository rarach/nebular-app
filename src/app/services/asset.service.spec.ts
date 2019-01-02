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
        expect(assetService.customAssetCodes.length).toBe(0);
    }));
    it("returns all available asset codes excluding XLM", inject([CookieService], (cookieService) => {
        const assetService = new AssetService(cookieService);
        assetService.customAssetCodes.push("XYZZ");
        const allAssetCodes = assetService.getAllAssetCodes();
        expect(allAssetCodes.length).toBeGreaterThan(5);
        expect(allAssetCodes[0]).toEqual("BTC");
        expect(allAssetCodes[1]).toEqual("CNY");    //etc...
        expect(allAssetCodes).toContain("XYZZ");
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
        expect(assetService.customAssetCodes).toEqual(["Asdf", "jkl77", "USD", "BeefCoin"]);
        expect(assetService.customAnchors).toEqual([
            new Account("GA123456", "example.org", "example.org"),
            new Account("GBBBBBBBBBBBB", "this_is IT", "this_is IT"),
            new Account("GARFANKEL64ASDF45ASDF4A5SD4F5A1SD0FSDGJLVH12", "&$@@@_{{", "&$@@@_{{")
        ]);
        expect(assetService.customAssets).toEqual([
            new Asset("ABC", "ABC", null, new Account("G0101010101010101", "G010101010101010...", "G010101010101010...")),
            new Asset("abcdef", "abcdef", "credit_alphanum12", new Account("GGGGGGGGaposdyuhfjkasndfm8415", "GGGGGGGGaposdyuh...", "GGGGGGGGaposdyuh...")),
            new Asset("btC", "btC", null, new Account("GGGGGGK", "GGGGGGK...", "GGGGGGK...")),
            new Asset("CNY", "CNY", "credit_alphanum4",
                      new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "RippleFox", "ripplefox.com"))
        ]);
        expect(assetService.customExchanges).toEqual([
            new ExchangePair("5555",
                             new Asset("USD", "USD", null, new Account("GAAAASLIMIT", "GAAAASLIMIT...", "GAAAASLIMIT...")),
                             new Asset("XLM", "XLM", null, new Account(/*native*/null, "(native)", "(native)"))),
            new ExchangePair("12345",
                             new Asset("lightcoin", "lightcoin", "credit_alphanum12", new Account("GIBRALTARRRRR458743551", "GIBRALTARRRRR458...", "GIBRALTARRRRR458...")),
                             new Asset("XrP", "XrP", "credit_alphanum4", new Account("G0G0G0G0", "G0G0G0G0...", "G0G0G0G0..."))),
            new ExchangePair("10101010",
                             new Asset("XLM", "XLM", "native", new Account(null, "(native)", "(native)")),
                             new Asset("xlm", "xlm", null, new Account(null, "(native)", "(native)")))
        ]);
    });
    it("#getAssetCodesForExchange() ", () => {
        const codes = assetService.getAssetCodesForExchange();
        expect(codes).toEqual(["XLM", "BTC", "CNY", "ETH", "EURT", "HKDT", "LTC", "MOBI", "NGNT", "PHP", "REPO", "RMT", "SLT", "USD", "ABC", "abcdef", "btC"]);
    });
    it("#getAllAnchors() returns common+custom anchors", () => {
        const issuers = assetService.getAllAnchors();
        expect(issuers.length).toBe(21);
        expect(issuers[0]).toEqual(new Account(null, "(native)", "(native)"));
        expect(issuers[1]).toEqual(KnownAccounts.NaoBTC);
        expect(issuers[2]).toEqual(KnownAccounts.Papaya2);      //etc...
        expect(issuers).toContain(new Account("GA123456", "example.org", "example.org"));
        expect(issuers).toContain(new Account("GARFANKEL64ASDF45ASDF4A5SD4F5A1SD0FSDGJLVH12", "&$@@@_{{", "&$@@@_{{"));
    });
    it("#GetIssuersByAssetCode('CNY') gives common+custom assets", () => {
        assetService.AddCustomAsset("CNY", "GBELS050505050505050505");
        const assets = assetService.GetIssuersByAssetCode("CNY");
        expect(assets).toEqual([
            KnownAccounts.RippleFox,
            new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "RippleFox", "ripplefox.com"),
            new Account("GBELS050505050505050505", "GBELS05050505050...", "GBELS05050505050...")
        ]);
    });
    it("#getFirstIssuerAddress('BTC') returns address of first BTC anchor", () => {
        expect(assetService.getFirstIssuerAddress("BTC")).toBe(/*naoBTC*/"GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH");
    });
    it("#getFirstIssuerAddress('NO_SUCH') returns null", () => {
        expect(assetService.getFirstIssuerAddress("NO_SUCH")).toBeNull();
    });
    it("#GetIssuerByAddress('GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R') returns Golix' Account", () => {
        const anchor = assetService.GetIssuerByAddress('GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R');
        expect(anchor.shortName).toBe("Golix");
        expect(anchor.domain).toBe("golix.io");
    });
    it("#GetIssuerByAddress('GBDDD_NOPE') returns null", () => {
        expect(assetService.GetIssuerByAddress("GBDDD_NOPE")).toBeNull();
    });
    it("#AddCustomAssetCode() returns FALSE for existing asset code", () => {
        expect(assetService.AddCustomAssetCode("USD")).toBe(false);
    });
    it("#AddCustomAssetCode('nEW') adds the code", () => {
        expect(assetService.customAssetCodes).not.toContain('nEW');
        expect(assetService.AddCustomAssetCode("nEW")).toBe(true);
        expect(assetService.customAssetCodes).toContain('nEW');
    });
    it("#RemoveCustomAssetCode() removes existing code", () => {
        assetService.customAssetCodes.push("OLD");
        expect(assetService.RemoveCustomAssetCode("OLD")).toBe(true);
        expect(assetService.customAssetCodes).not.toContain("OLD");
    });
    it("#RemoveCustomAssetCode('NOsuch') returns false", () => {
        expect(assetService.RemoveCustomAssetCode("NOsuch")).toBe(false);
    });
    it("#AddCustomAnchor() doesn't add new issuer if it already exists", () => {
        expect(assetService.customAnchors.length).toBe(3);
        expect(assetService.AddCustomAnchor("GBBBBBBBBBBBB", "golgotha.com")).toBe(false);
        expect(assetService.customAnchors.length).toBe(3);
    });
    it("#AddCustomAnchor() adds new issuer", () => {
        expect(assetService.customAnchors.length).toBe(3);
        expect(assetService.AddCustomAnchor("GOLGOTHA", "golgotha.com")).toBe(true);
        expect(assetService.customAnchors.length).toBe(4);
        expect(assetService.customAnchors).toContain(new Account("GOLGOTHA", "golgotha.com", "golgotha.com"));
    });
    it("#RemoveCustomAnchor() deletes existing anchor", () => {
        expect(assetService.customAnchors.length).toBe(3);
        expect(assetService.customAnchors).toContain(new Account("GA123456", "example.org", "example.org"));
        expect(assetService.RemoveCustomAnchor("GA123456")).toBe(true);
        expect(assetService.customAnchors.length).toBe(2);
        expect(assetService.customAnchors).not.toContain(new Account("GA123456", "example.org", "example.org"));
    });
    it("#RemoveCustomAnchor('Gnonsense') doesn't delete any anchor and returns FALSE", () => {
        expect(assetService.customAnchors.length).toBe(3);
        expect(assetService.RemoveCustomAnchor("Gnonsense")).toBe(false);
        expect(assetService.customAnchors.length).toBe(3);
    });
    it("#AddCustomAsset() gives NULL for duplicate entry and doesn't add it", () => {
        assetService.customAssets.push(new Asset("JPY", "Japanese yen", null, KnownAccounts.Mobius));
        expect(assetService.customAssets.length).toBe(5);
        expect(assetService.AddCustomAsset("JPY", "GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH")).toBeNull();
        expect(assetService.customAssets.length).toBe(5);
    });
    it("#AddCustomAsset() with known issuer", () => {
        expect(assetService.customAssets.length).toBe(4);
        const newAsset = assetService.AddCustomAsset("JPY", /*Mobius*/"GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH");
        expect(assetService.customAssets.length).toBe(5);
        expect(newAsset.code).toBe("JPY");
        expect(newAsset.fullName).toBe("JPY");
        expect(newAsset.type).toBe("credit_alphanum4");
        expect(newAsset.issuer).toBe(KnownAccounts.Mobius);
    });
    it("#AddCustomAsset() with unknown issuer", () => {
        expect(assetService.customAssets.length).toBe(4);
        const newAsset = assetService.AddCustomAsset("04", "GWYNETH");
        expect(assetService.customAssets.length).toBe(5);
        expect(newAsset.code).toBe("04");
        expect(newAsset.fullName).toBe("04");
        expect(newAsset.type).toBe("credit_alphanum4");
        expect(newAsset.issuer).toEqual(new Account("GWYNETH", "GWYNETH...", "GWYNETH..."))
    });
    it("#RemoveCustomAsset() deletes custom asset", () => {
        assetService.customAssets.push(new Asset("TRY", "Turkish lyra", null, new Account("GOGODanceQQQ", "test you you testing test", "nebul.ar")));
        expect(assetService.customAssets.length).toBe(5);
        expect(assetService.RemoveCustomAsset("TRY", "GOGODanceQQQ")).toBe(true);
        expect(assetService.customAssets.length).toBe(4);
    });
    it("#RemoveCustomAsset() returns false and doesn't delete anything for missing asset", () => {
        expect(assetService.customAssets.length).toBe(4);
        expect(assetService.RemoveCustomAsset("TRY", "GOGODanceQQQ")).toBe(false);
        expect(assetService.customAssets.length).toBe(4);
    });
    it("#CreateCustomExchange() creates new XLM/XLM pair and adds to custom exchanges", () => {
        expect(assetService.customExchanges.length).toBe(3);
        const newPair = assetService.CreateCustomExchange();
        expect(assetService.customExchanges.length).toBe(4);
        expect(newPair.id).toBeTruthy();
        expect(newPair.baseAsset).toEqual(new Asset("XLM", "Lumen", "native", new Account(null, "(native)", "(native)")));
        expect(newPair.counterAsset.code).toBe("XLM");
    });
    it("#UpdateCustomExchange() updates existing pair", () => {
        //Sanity checks first
        expect(assetService.customExchanges.length).toBe(3);
        expect(assetService.customExchanges[1].baseAsset.issuer.address).toBe("GIBRALTARRRRR458743551");
        expect(assetService.customExchanges[1].counterAsset.code).toBe("XrP");
        const updatedExch = assetService.UpdateCustomExchange("12345", "MXN", "GUPDATED", "DDD", "GBBBBBBBBBBBB");
        expect(assetService.customExchanges.length).toBe(3);
        expect(updatedExch.id).toBe("12345");
        expect(updatedExch.baseAsset).toEqual(new Asset("MXN", "MXN", null, new Account("GUPDATED", "GUPDATED...", "GUPDATED...")));
        expect(updatedExch).toBe(assetService.customExchanges[1]);
        expect(updatedExch.counterAsset.code).toBe("DDD");
    });
    it("#UpdateCustomExchange() with bad exchange ID returns null", () => {
        expect(assetService.UpdateCustomExchange("0w645612a", "ABC", "G012", null, null)).toBeNull();
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
    it("#serializeToCookie() works", () => {
        assetService.customAssetCodes.push("COOK");
        assetService.customAnchors.push(new Account("GCookie", "Coockie string test", "cook.ie"));
        assetService.customAssets.push(KnownAssets["USD-AnchorUsd"]);
        assetService.customExchanges.push(new ExchangePair("c00k1e",
                                                          new Asset("C00K", "Cookie token", "credit_alpanum4", new Account("G0141414", "cook-test", "asdf.org")),
                                                          KnownAssets["ETH-fchain"]));
        //Call one of the methods that internally call serializeToCookie()
        assetService.AddCustomAssetCode("C01K");

        const cookieService = TestBed.get(CookieService);
        expect(cookieService.values["aco"]).toBe("Asdf,jkl77,USD,BeefCoin,COOK,C01K");
        expect(cookieService.values["iss"]).toBe("GA123456%2Fexample.org,GBBBBBBBBBBBB%2Fthis_is%20IT,GARFANKEL64ASDF45ASDF4A5SD4F5A1SD0FSDGJLVH12%2F%26%24%40%40%40_%7B%7B,GCookie%2Fcook.ie");
        expect(cookieService.values["ass"]).toBe("ABC-G0101010101010101,abcdef-GGGGGGGGaposdyuhfjkasndfm8415,btC-GGGGGGK,CNY-GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX,USD-GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX");
        expect(cookieService.values["exc"]).toBe("5555#USD-GAAAASLIMIT/XLM,12345#lightcoin-GIBRALTARRRRR458743551/XrP-G0G0G0G0,10101010#XLM/xlm-null,c00k1e#C00K-G0141414/ETH-GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIO2QZQ7IOZ4YC5XV3C2IKYU");
    });
});



class CookieServiceStub {
    get(key: string): string {
        if ("aco" === key) {
            return "Asdf,jkl77,USD,BeefCoin";
        }
        if ("iss" === key) {
            return "GA123456/example.org, GBBBBBBBBBBBB/this_is IT, GARFANKEL64ASDF45ASDF4A5SD4F5A1SD0FSDGJLVH12/&$@@@_{{";
        }
        if ("ass" === key) {
            return "ABC-G0101010101010101, abcdef-GGGGGGGGaposdyuhfjkasndfm8415,btC-GGGGGGK,CNY-GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX";
        }
        if ("exc" === key) {
            return "5555#USD-GAAAASLIMIT/XLM,12345#lightcoin-GIBRALTARRRRR458743551/XrP-G0G0G0G0, 10101010#XLM/xlm";
        }
        else throw new Error("No test data ready for given inputs (cookie key = '" + key + "')");
    }

    values = new Array();
    put(key: string, value: string, options: any) {
        if ("aco" === key || "iss" === key || "ass" === key || "exc" === key) {
            this.values[key] = value;
            return;
        }

        throw `No test data ready for inputs key=${key}; value=${value}`;
    }
}
