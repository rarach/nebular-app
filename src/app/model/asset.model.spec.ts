import { Asset } from "./asset.model";
import { Constants } from "./constants";


describe("Asset (model)", () => {
    it("empty asset code/type in constructor defaults to XLM (native)", () => {
        const asset = new Asset(null, "Looomens", null, null);

        expect(asset.code).toBe("XLM");
        expect(asset.type).toBe(Constants.NATIVE_ASSET_TYPE);
        expect(asset.imageUrl).toBe(Constants.NATIVE_ASSET_IMAGE);
        expect(asset.IsNative()).toBe(true);
    });

    it("short asset code constructs Asset with type='credit_alphanum4'", () => {
        const asset = new Asset('COIN', null, null, null);

        expect(asset.code).toBe('COIN');
        expect(asset.type).toBe('credit_alphanum4');
        expect(asset.imageUrl).toBe(Constants.UNKNOWN_ASSET_IMAGE);
    });
    
    //mm-TODO: test #ToUrlParameters() etc.
});
