import { ActivatedRoute } from '@angular/router';
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AssetData } from 'src/app/model/asset-data.model';
import { AssetService } from 'src/app/services/asset.service';
import { GETParams } from 'src/app/model/constants';
import { HorizonRestService } from 'src/app/services/horizon-rest.service';
import { IssuerConfiguration } from 'src/app/model/toml/issuer-configuration';
import { TomlConfigService } from 'src/app/services/toml-config.service';


@Component({
  selector: 'app-custom-asset-wizard',
  templateUrl: './custom-asset-wizard.component.html',
  styleUrls: ['./custom-asset-wizard.component.css']
})
export class CustomAssetWizardComponent implements OnInit, OnDestroy {
    @Output() assetAdded = new EventEmitter();
    @Output() addAssetFailed = new EventEmitter();
    private _getParamsSubscriber: Subscription;
    inputAssetCode: string = "";
    foundAssets: AssetData[];
    searchStatus: string = null;

    constructor(private route: ActivatedRoute,
                private horizonService: HorizonRestService,
                private configService: TomlConfigService,
                private assetService: AssetService) {
                }

    ngOnInit() {
        //Handle GET parameter 'assetType'
        this._getParamsSubscriber = this.route.paramMap.subscribe(params => {
            this.inputAssetCode = params.get(GETParams.ASSET_TYPE);
        });
    }

    ngOnDestroy() {
        this._getParamsSubscriber.unsubscribe();
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

    addAsset(code: string, issuerAddress: string, issuerDomain: string) {
        const asset = this.assetService.AddCustomAsset(code, issuerAddress, issuerDomain);
        if (asset !== null) {
            this.assetAdded.emit({newAssetCode: code, newAssetIssuer: issuerAddress});
        }
        else {
            this.addAssetFailed.emit({assetCode: code, assetIssuer: issuerAddress});
        }

        for (let i=0; i<this.foundAssets.length; i++) {
            if (this.foundAssets[i].code === code && this.foundAssets[i].issuerAddress === issuerAddress) {
                this.foundAssets.splice(i, 1);
                break;
            }
        }
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
