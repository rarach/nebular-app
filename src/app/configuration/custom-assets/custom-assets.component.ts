import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Asset } from 'src/app/model/asset.model';
import { AssetService } from 'src/app/asset.service';
import { GETParams } from 'src/app/model/constants';


@Component({
    selector: 'app-custom-assets',
    templateUrl: './custom-assets.component.html',
    styleUrls: ['./custom-assets.component.css']
})
export class CustomAssetsComponent implements OnInit, OnDestroy {
    private _getParamsSubscriber: Subscription;
    selectedAssetCode: string = null;
    private _selectedIssuerAddress: string = null;
    customAssets: Asset[];
    lastAddedAsset: Asset = null;


    constructor(private route: ActivatedRoute, private assetService: AssetService) {
        this.customAssets = assetService.customAssets;
    }

    ngOnInit() {
        //Handle GET parameter 'assetType'
        this._getParamsSubscriber = this.route.queryParamMap.subscribe(params => {
            this.selectedAssetCode = params.get(GETParams.ASSET_TYPE);
        });
    }

    ngOnDestroy() {
        this._getParamsSubscriber.unsubscribe();
    }


    addAsset() {
        if (null == this.selectedAssetCode || null == this._selectedIssuerAddress) {
            return;
        }
        const newAsset: Asset = this.assetService.AddCustomAsset(this.selectedAssetCode, this._selectedIssuerAddress);
        if (null != newAsset) {
            this.lastAddedAsset = newAsset;
        }
    }

    removeAsset(asdf, jklsemi) {
        //todo
    }
}
