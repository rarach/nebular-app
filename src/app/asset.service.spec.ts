import { TestBed, inject } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie';

import { AssetService } from './asset.service';
import { Account } from './model/account.model';
import { Asset } from './model/asset.model';


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
            return "todo";
        }
        else throw new Error("No test data ready for given inputs (cookie key = '" + key + "')");
    }
}

describe('AssetService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{
                provide: CookieService,
                useClass: CookieServiceStub
            }]
        });
    });

    it('should load custom assets and exchanges', inject([CookieService], (cookieService) => {
        const assetService = new AssetService(cookieService);
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
                      new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "GAREELUB43IRHWEA...", "GAREELUB43IRHWEA..."))
        ]);
    }));
});
