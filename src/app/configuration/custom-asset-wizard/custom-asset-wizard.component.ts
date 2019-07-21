import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AssetData } from 'src/app/model/asset-data.model';
import { AssetService } from 'src/app/services/asset.service';
import { HorizonRestService } from 'src/app/services/horizon-rest.service';
import { IssuerConfiguration } from 'src/app/model/toml/issuer-configuration';
import { TomlConfigService } from 'src/app/services/toml-config.service';


@Component({
  selector: 'app-custom-asset-wizard',
  templateUrl: './custom-asset-wizard.component.html',
  styleUrls: ['./custom-asset-wizard.component.css']
})
export class CustomAssetWizardComponent {
    foundAssets: AssetData[];
    searchStatus: string = null;

    constructor(private horizonService: HorizonRestService,
                private configService: TomlConfigService,
                private assetService: AssetService) {
                }

    searchAssetCodes(theForm: NgForm) {
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

    addAsset(code: string, issuerAddres: string, issuerDomain: string) {
        this.assetService.AddCustomAsset(code, issuerAddres, issuerDomain);
    }

    /** Compare two AssetData instances for purpose of sorting them in descending order based on trustline count */
    private compareAssetData(a: AssetData, b: AssetData): number {
        return b.trustlineCount - a.trustlineCount;
    }

    /** For each asset that has configuration attached, try to get its icon */ 
    private loadAssetIcons() {
        if (!this.foundAssets) {
            return;
        }

        for (let asset of this.foundAssets) {
            if (asset.tomlLink) {
                this.configService.getIssuerConfig(asset.tomlLink).subscribe(issuerConfig => {
                    this.loadAssetData(asset, issuerConfig);
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
