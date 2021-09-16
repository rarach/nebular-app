import { async, TestBed } from '@angular/core/testing';

import { Asset } from "./asset.model";
import { Constants } from "./constants";
import { AssetService } from "../services/asset.service";


describe("Asset (model)", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AssetService, useClass: AssetServiceStub }
            ]
        })
        .compileComponents();
    }));

    it("empty asset code/type defaults to XLM/native", () => {
        const asset = new Asset(null, "Looomens", null, null);
        expect(asset.code).toBe("XLM");
        expect(asset.type).toBe(Constants.NATIVE_ASSET_TYPE);
        expect(asset.IsNative()).toBe(true);
    });
    
    //mm-TODO: test #ToUrlParameters() etc.
});

class AssetServiceStub {
    getFirstIssuerAddress(assetCode: string) {
        if ("T0KEN" ===  assetCode) {
            return "GAA2828282828";
        }
        if ("UNKN" === assetCode) {
            return null;
        }
        throw `No test data ready for input '${assetCode}`;
    }
}
