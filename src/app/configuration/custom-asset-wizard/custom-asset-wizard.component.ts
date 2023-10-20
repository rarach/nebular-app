import { ActivatedRoute } from '@angular/router';
import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AssetData } from '../../model/asset-data.model';
import { AssetService } from '../../services/asset.service';
import { Constants } from '../../model/constants';
import { HorizonRestService } from '../../services/horizon-rest.service';
import { IssuerConfiguration } from '../../model/toml/issuer-configuration';
import { TomlConfigService } from '../../services/toml-config.service';

@Component({
  selector: 'nebular-custom-asset-wizard',
  templateUrl: './custom-asset-wizard.component.html',
  styleUrls: ['./custom-asset-wizard.component.css']
})
export class CustomAssetWizardComponent {
    @Output() public assetAdded = new EventEmitter();
    @Output() public addAssetFailed = new EventEmitter();
    public inputAssetCode = "";
    public foundAssets: AssetData[];
    public searchStatus: string = null;

    constructor(private route: ActivatedRoute,
                private horizonService: HorizonRestService,
                private configService: TomlConfigService,
                private assetService: AssetService)
    { }


    public searchAssetCodes(theForm: NgForm): void {
      const assetCode = theForm.value.newAssetCode;
      if (theForm.invalid || (assetCode || "").length <= 0)
      {
        return;
      }

      this.horizonService.getAssetIssuers(assetCode).subscribe(assetsData => {
        this.foundAssets = assetsData ? assetsData.sort(this.compareAssetData) : null;
        this.searchStatus = "FINISHED";
        this.loadAssetIcons();
      });
    }

    public addAsset(newAsset: AssetData): void {
      const asset = this.assetService.AddCustomAsset(newAsset.code, newAsset.issuerAddress, newAsset.domain, newAsset.iconUrl);
      if (asset !== null) {
        this.assetAdded.emit({newAssetCode: newAsset.code, newAssetIssuer: newAsset.issuerAddress});
      }
      else {
        this.addAssetFailed.emit({assetCode: newAsset.code, assetIssuer: newAsset.issuerAddress});
      }

      for (let i=0; i<this.foundAssets.length; i++) {
        if (this.foundAssets[i].code === newAsset.code && this.foundAssets[i].issuerAddress === newAsset.issuerAddress) {
          this.foundAssets.splice(i, 1);
          break;
        }
      }
    }


    /** Compare two AssetData instances for purpose of sorting them in descending order based on trustline count */
    private compareAssetData(a: AssetData, b: AssetData): number {
      return b.trustlineCount - a.trustlineCount;
    }


    //TODO: we shouldn't do this low-end stuff here. Shield it behind the AssetService

    /** For each asset that has configuration attached, try to get its icon */ 
    private loadAssetIcons() {
      if (!this.foundAssets) {
        return;
      }

      for (const asset of this.foundAssets) {
        if (asset.tomlLink) {
          this.configService.getIssuerConfig(asset.tomlLink).subscribe({
            next: (issuerConfig) => {
              this.loadAssetData(asset, issuerConfig);
            },
            error: () => {
              //Likely an unreachable stellar.toml
              asset.iconUrl = Constants.UNKNOWN_ASSET_IMAGE;
            }
          });
        }
      }
    }

    private loadAssetData(foundAsset: AssetData, issuerConfig: IssuerConfiguration) {
      const theAsset = issuerConfig.currencies.find(assetConf => {
        return assetConf.code === foundAsset.code && assetConf.issuer === foundAsset.issuerAddress;
      });

      if (theAsset && theAsset.image) {
        foundAsset.iconUrl = theAsset.image;
      }
    }
}
