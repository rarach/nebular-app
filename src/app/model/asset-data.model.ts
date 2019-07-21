import { Utils } from "../utils";

/** Simple asset meta-data as returned by horizon/assets?asset_code=ASDF */
export class AssetData {
    public iconUrl: string = "./assets/images/asset_icons/unknown.png";

    constructor(public tomlLink: string, public assetType: string, public code: string,
                public issuerAddress: string, public trustlineCount: number) {
    }

    get domain(): string {
        if (this.tomlLink) {
            return Utils.parseDomain(this.tomlLink);
        }
        return this.issuerAddress.substring(0, 8) + "..." + this.issuerAddress.substring(48);
    }
}
