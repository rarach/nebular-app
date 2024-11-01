import { Subscription } from "rxjs";
import { Constants } from "./constants";
import { HorizonRestService } from "../services/horizon-rest.service";
import { IssuerConfiguration } from "./toml/issuer-configuration";
import { TomlConfigService } from "../services/toml-config.service";
import { Utils } from "../utils";

export class AssetStatistics {
  public assetTitle: string;
  public assetIcon: string;
  public numTrades = 0;
  public volume = 0.0;
  public volumeInNative = 0.0;
  public hidden = false;
  public readonly id: string;
  private readonly _subscription: Subscription;

  constructor(
    horizonService: HorizonRestService,
    configService: TomlConfigService,
    fullnameFilters: Set<string>,
    public readonly assetCode: string,
    private readonly issuer: string
  ) {
    this.id = assetCode + '-' + issuer;
    this._subscription = horizonService.getIssuerConfigUrl(assetCode, issuer)
      .subscribe(configUrl => {
        if (configUrl) {
          configService.getIssuerConfig(configUrl).subscribe({
            next: (issuerConfig) => {
              this.loadAssetData(issuerConfig);
            },
            error: () => {
              //Usually a request blocked by the browser or proxy
              this.assetIcon = Constants.UNKNOWN_ASSET_IMAGE;
            }
          });

          //Derive asset's domain from config URL
          const domain = Utils.parseDomain(configUrl);
          this.assetTitle = this.assetCode + "-" + domain;
        }
        else {
          this.assetTitle = this.assetCode + "-" + this.issuer.substring(0, 8) + "..." + this.issuer.substring(48);
          this.assetIcon = `./assets/images/asset_icons/${this.assetCode}.png`;
        }

        this.checkFilter(fullnameFilters);
      });
  }

  public feedData(amount: number, lastPriceInXlm: number): void {
    this.numTrades++;
    this.volume += amount;
    this.volumeInNative = this.volume * lastPriceInXlm;
  }

  public destroy(): void {      //TODO: we shouldn't need this. Find a working alternative to takeUntilDestroyed()
    this._subscription?.unsubscribe();
  }


  private loadAssetData(issuerConfig: IssuerConfiguration) {
    const theAsset = issuerConfig.currencies.find(asset => {
      return asset.code === this.assetCode && asset.issuer === this.issuer;
    });
    this.assetIcon = theAsset ? theAsset.image : './assets/images/asset_icons/unknown.png';
  }

  private checkFilter(fullnameFilters: Set<string>): void {
    for (const filter of fullnameFilters) {
      if (this.assetTitle.includes(filter)) {
        this.hidden = true;
        return;
      }
    }
  }
}
