import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Asset } from 'src/app/model/asset.model';
import { AssetService } from 'src/app/services/asset.service';
import { GETParams } from 'src/app/model/constants';
import { DropdownOption } from 'src/app/model/dropdown-option';


@Component({
    selector: 'app-custom-assets',
    templateUrl: './custom-assets.component.html',
    styleUrls: ['./custom-assets.component.css']
})
export class CustomAssetsComponent implements OnInit, OnDestroy {
    private _getParamsSubscriber: Subscription;
    selectedAssetCode: string = "";
    assetIssuers: DropdownOption<string>[] = null;
    selectedIssuerAddress: string = "";
    customAssets: Asset[];
    lastAddedAsset: Asset = null;
    duplicateAsset: string = null;


    constructor(private route: ActivatedRoute, private assetService: AssetService) {
        this.customAssets = assetService.customAssets;
    }

    ngOnInit() {
        //Handle GET parameter 'assetType'
        this._getParamsSubscriber = this.route.paramMap.subscribe(params => {
            this.selectedAssetCode = params.get(GETParams.ASSET_TYPE);
        });
        this.loadAnchors();
    }

    ngOnDestroy() {
        this._getParamsSubscriber.unsubscribe();
    }

    removeAsset(assetCode, anchorAddress) {
        this.assetService.RemoveCustomAsset(assetCode, anchorAddress);
    }

    /** Should be called when list of available issuers changes. Will update the respective dropdown. */
    updateIssuers() {           //TODO: delete
        this.loadAnchors()
    }

    highlightLastAddedAsset(eventData) {
        for (let asset of this.customAssets) {
            if (asset.code === eventData.newAssetCode && asset.issuer.address === eventData.newAssetIssuer)
            {
                this.lastAddedAsset = asset;
                this.duplicateAsset = null;
                break;
            }
        }
    }

    highlightDuplicateAsset(eventData) {
        this.duplicateAsset = eventData.assetCode + "-" + eventData.assetIssuer;
        this.lastAddedAsset = null;
    }


    private loadAnchors() {     //TODO: delete the function
        this.assetIssuers = new Array<DropdownOption<string>>();
        const anchors = this.assetService.getAllAnchors();
        for (let i=0; i<anchors.length; i++) {
            const issuerAccount = anchors[i];
            if (issuerAccount.IsNativeIssuer()) {
                continue;
            }
            const tooltip = issuerAccount.domain + " (" + issuerAccount.address.substring(0, 8) + "..." + issuerAccount.address.substring(48) + ")";
            this.assetIssuers.push(new DropdownOption(issuerAccount.address, tooltip, issuerAccount.address));
        }
    }
}
