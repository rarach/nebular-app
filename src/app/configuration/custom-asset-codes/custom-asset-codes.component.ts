import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AssetService } from '../../asset.service';
import { GETParams } from 'src/app/model/constants';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-custom-asset-codes',
    templateUrl: './custom-asset-codes.component.html',
    styleUrls: ['./custom-asset-codes.component.css']
})
export class CustomAssetCodesComponent implements OnInit {
    private _getParamsSubscriber: Subscription;         //TODO: NO! These two actually belong to new component custom-assets
    private _selectedAssetCode: string = null;
    customAssetCodes: string[];
    latestAddedCode: string;
    duplicateAssetCode: string;


    constructor(private route: ActivatedRoute, private assetService: AssetService) {
        this.customAssetCodes = this.assetService.customAssetCodes;
    }


    ngOnInit() {
        //Handle GET parameter 'assetType'
        this._getParamsSubscriber = this.route.queryParamMap.subscribe(params => {
            this._selectedAssetCode = params.get(GETParams.ASSET_TYPE);
        });
    }

    addAssetCode(theForm: NgForm) {
        this.duplicateAssetCode = null;
        if (theForm.invalid)
        {
            return;
        }
        const assetCode = theForm.value.newAssetCode;

        if (this.customAssetCodes.indexOf(assetCode) > -1)
        {
            //The same code is already in the list. Highlight the existing item
            this.duplicateAssetCode = assetCode;
            return;
        }

        if (this.assetService.AddCustomAssetCode(assetCode)) {
            this.latestAddedCode = assetCode;
            theForm.reset();
//TODO            setupAssetCodeDropDown(_selectedAssetCode);
        }
    }

    removeAssetCode(assetCode: string) {
        if (this.assetService.RemoveCustomAssetCode(assetCode)) {
//TODO            setupAssetCodeDropDown(_selectedAssetCode);
        }
    }
}
