import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AssetService } from '../../asset.service';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-custom-asset-codes',
    templateUrl: './custom-asset-codes.component.html',
    styleUrls: ['./custom-asset-codes.component.css']
})
export class CustomAssetCodesComponent {
    customAssetCodes: string[];
    latestAddedCode: string;
    duplicateAssetCode: string;


    constructor(private route: ActivatedRoute, private assetService: AssetService) {
        this.customAssetCodes = this.assetService.customAssetCodes;
    }


    addAssetCode(theForm: NgForm) {
        this.duplicateAssetCode = null;
        const assetCode = theForm.value.newAssetCode;
        if (theForm.invalid || (assetCode || "").length <= 0)
        {
            return;
        }

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
