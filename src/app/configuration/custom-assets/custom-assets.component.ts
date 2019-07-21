import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Asset, KnownAssets } from 'src/app/model/asset.model';
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
    assetCodes: DropdownOption[] = null;
    selectedAssetCode: string = "";
    assetIssuers: DropdownOption[] = null;
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
        this.loadAssetCodes();
        this.loadAnchors();
    }

    ngOnDestroy() {
        this._getParamsSubscriber.unsubscribe();
    }


    addAsset() {
        this.duplicateAsset = null;

        if (!this.selectedAssetCode || !this.selectedIssuerAddress) {
            return;
        }
        const newAsset: Asset = this.assetService.AddCustomAsset(this.selectedAssetCode, this.selectedIssuerAddress);
        if (null != newAsset) {
            this.lastAddedAsset = newAsset;
        }
        else {
            this.duplicateAsset = this.selectedAssetCode + "-" + this.selectedIssuerAddress;
        }
    }

    removeAsset(assetCode, anchorAddress) {
        this.assetService.RemoveCustomAsset(assetCode, anchorAddress);
    }

    /** Should be called when list of available asset codes changes. Will update the respective dropdown. */
    updateAssetCodes() {
        this.loadAssetCodes();
    }

    /** Should be called when list of available issuers changes. Will update the respective dropdown. */
    updateIssuers() {
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

    private loadAssetCodes() {
        this.assetCodes = new Array<DropdownOption>();
        const codes: string[] = this.assetService.getAllAssetCodes();
        for(let assetCode of codes) {
            //Search for asset full name among know assets
            let assetFullName = assetCode + " (custom)";
            for (var asset in KnownAssets) {
                if (KnownAssets[asset].code === assetCode) {
                    assetFullName = KnownAssets[asset].fullName;
                    break;
                }
            }

            this.assetCodes.push(new DropdownOption(assetCode, assetCode, assetFullName));
        }
    }

    private loadAnchors() {
        this.assetIssuers = new Array<DropdownOption>();
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
