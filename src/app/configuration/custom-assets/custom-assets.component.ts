import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { Asset } from '../../model/asset.model';
import { AssetService } from '../../services/asset.service';
import { DropdownOption } from '../../model/dropdown-option';


@Component({
    selector: 'nebular-custom-assets',
    templateUrl: './custom-assets.component.html',
    styleUrls: ['./custom-assets.component.css']
})
export class CustomAssetsComponent {
    assetIssuers: DropdownOption<string>[] = null;
    selectedIssuerAddress: string = "";
    customAssets: Asset[];
    lastAddedAsset: Asset = null;
    duplicateAsset: string = null;


    constructor(private route: ActivatedRoute, private assetService: AssetService) {
        this.customAssets = assetService.customAssets;
    }

    removeAsset(assetCode, anchorAddress) {
        this.assetService.RemoveCustomAsset(assetCode, anchorAddress);
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
}
