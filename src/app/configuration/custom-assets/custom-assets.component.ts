import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Asset, KnownAssets } from 'src/app/model/asset.model';
import { AssetService } from 'src/app/services/asset.service';
import { GETParams } from 'src/app/model/constants';

declare var jQuery: any;  //Supporting jQuery's plugin ddSlick


@Component({
    selector: 'app-custom-assets',
    templateUrl: './custom-assets.component.html',
    styleUrls: ['./custom-assets.component.css']
})
export class CustomAssetsComponent implements OnInit, OnDestroy {
    private _getParamsSubscriber: Subscription;
    private _selectedAssetCode: string = null;
    private _selectedIssuerAddress: string = null;
    customAssets: Asset[];
    lastAddedAsset: Asset = null;


    constructor(private route: ActivatedRoute, private assetService: AssetService) {
        this.customAssets = assetService.customAssets;
    }

    ngOnInit() {
        //Handle GET parameter 'assetType'
        this._getParamsSubscriber = this.route.queryParamMap.subscribe(params => {
            this._selectedAssetCode = params.get(GETParams.ASSET_TYPE);
        });
        this.setupAssetCodeDropDown(this._selectedAssetCode);
        this.setupAnchorDropDown();
    }

    ngOnDestroy() {
        this._getParamsSubscriber.unsubscribe();
    }


    addAsset() {
        if (null == this._selectedAssetCode || null == this._selectedIssuerAddress) {
            return;
        }
        const newAsset: Asset = this.assetService.AddCustomAsset(this._selectedAssetCode, this._selectedIssuerAddress);
        if (null != newAsset) {
            this.lastAddedAsset = newAsset;
        }
    }

    removeAsset(assetCode, anchorAddress) {
        this.assetService.RemoveCustomAsset(assetCode, anchorAddress);
    }

    /** Should be called when list of available asset codes changes. Will update the respective dropdown. */
    updateAssetCodes() {
        this.setupAssetCodeDropDown(this._selectedAssetCode);
    }

    /** Should be called when list of available issuers changes. Will update the respective dropdown. */
    updateIssuers() {
        this.setupAnchorDropDown();
    }

    /** Setup the drop-down with known asset codes */
    private setupAssetCodeDropDown(selectedAssetType: string) {
        //In case this is re-init, destroy previous instance
        jQuery('div[id^="assetTypesDropDown"]').ddslick('destroy');

        const assetTypesList = [{
            text: "<i style='color: gray;'>asset type...</i>",
            value: null,
            selected: false,
            description: null,
            imageSrc: null
        }];
        this.assetService.getAllAssetCodes().forEach(function(assetCode: string) {
            //Search for asset full name among know assets
            let assetFullName = assetCode + " (custom)";
            for (var asset in KnownAssets) {
                if (KnownAssets[asset].AssetCode === assetCode) {
                    assetFullName = KnownAssets[asset].FullName;
                    break;
                }
            }
    
            assetTypesList.push({
                text: assetCode,
                value: assetCode,
                selected: assetCode === selectedAssetType,
                description: assetFullName,
                imageSrc: "./assets/images/asset_icons/" + assetCode + ".png"
            });
        });

        const that = this;
        jQuery("#assetTypesDropDown").ddslick({
            data: assetTypesList,
            width: 150,
            onSelected: function (data) {
                if (null === data.selectedData.value ) {
                    jQuery('div[id^="anchorsDropDown"]').ddslick('select', {index: 0 });
                }
                that._selectedAssetCode = data.selectedData.value;
            }
        });
    }

    private setupAnchorDropDown() {
        //In case this is re-init, destroy previous instance
        jQuery('div[id^="anchorsDropDown"]').ddslick('destroy');

        const assetIssuersDdData = [{
            text: "<i style='color: gray;'>asset issuer...</i>",
            value: null,
            selected: false,
            description: null
        }];
        const anchors = this.assetService.getAllAnchors();
        for (let i=0; i<anchors.length; i++) {
            const issuerAccount = anchors[i];
            if (issuerAccount.IsNativeIssuer()) {
                continue;
            }
            assetIssuersDdData.push({
                text: issuerAccount.domain + " (" + issuerAccount.address.substring(0, 22) + "...)",
                description: issuerAccount.address,
                selected: this._selectedIssuerAddress === issuerAccount.address,
                value: issuerAccount.address
            });
        }

        const that = this;
        jQuery("#anchorsDropDown").ddslick({
            data: assetIssuersDdData,
            width: 420,
            onSelected: function (data) {
                that._selectedIssuerAddress = data.selectedData.value
            }
        });
    }
}
