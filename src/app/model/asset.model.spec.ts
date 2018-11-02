import { Asset } from "./asset.model";
import { Constants } from "./constants";


describe("Asset (model)", () => {
    it("empty asset code/type defaults to XLM/native", () => {
        const asset = new Asset(null, "Looomens", null, null);
        expect(asset.code).toBe("XLM");
        expect(asset.type).toBe(Constants.NATIVE_ASSET_TYPE);
        expect(asset.IsNative()).toBe(true);
    });
});
