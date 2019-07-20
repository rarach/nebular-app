import { HorizonRestService } from "../services/horizon-rest.service";
import { IssuerConfiguration } from "./toml/issuer-configuration";
import { TomlConfigService } from "../services/toml-config.service";
import { Utils } from "../utils";


export class AssetStatistics {
    public assetTitle: string;
    public assetIcon: string;
    public numTrades: number = 0;
    public volume: number = 0.0;
    public volumeInNative: number = 0.0;

    constructor(horizonSerice: HorizonRestService,
                configService: TomlConfigService,
                public assetCode: string,
                private issuer: string) {
        horizonSerice.getIssuerConfigUrl(assetCode, issuer).subscribe(configUrl => {
            if (configUrl) {
                configService.getIssuerConfig(configUrl).subscribe(issuerConfig => {
                    this.loadAssetData(issuerConfig);
                },
                error => {
                    //Usually a request blocked by the browser or proxy
                    this.assetIcon = `./assets/images/asset_icons/unknown.png`;
                });

                //Derive asset's domain from config URL
                const domain = Utils.parseDomain(configUrl);
                this.assetTitle = this.assetCode + "-" + domain;
            }
            else {
                this.assetTitle = this.assetCode + "-" + this.issuer.substring(0, 8) + "..." + this.issuer.substring(48);
                this.assetIcon = `./assets/images/asset_icons/${this.assetCode}.png`;
            }
        });
    }

    public feedData(amount: number, lastPriceInXlm: number) {
        this.numTrades++;
        this.volume += amount;
        this.volumeInNative = this.volume * lastPriceInXlm;
    }


    private loadAssetData(issuerConfig: IssuerConfiguration) {
        const theAsset = issuerConfig.currencies.find(asset => {
            return asset.code === this.assetCode && asset.issuer === this.issuer;
        });
        this.assetIcon = theAsset ? theAsset.image : null;
        if (!this.assetIcon) {
            //If no icon was provided, try our basic database
            this.assetIcon = `./assets/images/asset_icons/${this.assetCode}.png`;
        }
    }
}
