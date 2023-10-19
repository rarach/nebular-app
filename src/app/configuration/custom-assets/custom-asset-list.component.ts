import { Component } from '@angular/core';

import { Asset } from '../../model/asset.model';
import { AssetService } from '../../services/asset.service';
import { DropdownOption } from '../../model/dropdown-option';

@Component({
    selector: 'nebular-custom-asset-list',
    templateUrl: './custom-asset-list.component.html',
    styleUrls: ['./custom-asset-list.component.css']
})
export class CustomAssetListComponent {
    assetIssuers: DropdownOption<string>[] = null;
    selectedIssuerAddress: string = "";
    customAssets: Asset[];
    lastAddedAsset: Asset|null = null;
    duplicateAsset: string|null = null;


    constructor(private readonly assetService: AssetService) {
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
