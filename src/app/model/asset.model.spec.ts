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
    it("#ParseFromUrlParam() returns valid asset with known assetCode", () => {
        const assetService = TestBed.get(AssetService);
        const asset = Asset.ParseFromUrlParam("T0KEN", assetService);
        expect(asset.code).toBe("T0KEN");
        expect(asset.issuer.address).toBe("GAA2828282828");
    });
    it("#ParseFromUrlParam() throws error for missing issuer", () => {
        const assetService = TestBed.get(AssetService);
        expect( () => Asset.ParseFromUrlParam("UNKN", assetService)).toThrow("Invalid URL parameters (missing issuer): UNKN");
    });
    it("#ParseFromUrlParam() returns native asset for assetCode 'XLM'", () => {
        const asset = Asset.ParseFromUrlParam("XLM", null);
        expect(asset.code).toBe("XLM");
        expect(asset.type).toBe("native");
        expect(asset.issuer.address).toBeNull();
    });
    it("#ParseFromUrlParam() returns valid asset for unknown assetCode", () => {
        const assetService = TestBed.get(AssetService);
        const asset = Asset.ParseFromUrlParam("TKN335-GADDRESSOFISSUER636585454152", assetService);
        expect(asset.code).toBe("TKN335");
        expect(asset.type).toBe("credit_alphanum12");
        expect(asset.issuer.address).toBe("GADDRESSOFISSUER636585454152");
    });
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
