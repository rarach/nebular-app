import { Component } from '@angular/core';

import { Asset } from '../../model/asset.model';
import { AssetService } from '../../services/asset.service';

@Component({
  selector: 'nebular-custom-asset-list',
  templateUrl: './custom-asset-list.component.html',
  styleUrls: ['./custom-asset-list.component.css']
})
export class CustomAssetListComponent {
  public customAssets: Asset[];
  public lastAddedAsset: Asset|null = null;
  public duplicateAsset: string|null = null;

  public constructor(private readonly assetService: AssetService) {
    this.customAssets = assetService.customAssets;
  }

  public removeAsset(assetCode: string, anchorAddress: string): void {
    this.assetService.RemoveCustomAsset(assetCode, anchorAddress);
  }

  public highlightLastAddedAsset(eventData: { newAssetCode: string, newAssetIssuer: string }): void {
    for (const asset of this.customAssets) {
      if (asset.code === eventData.newAssetCode && asset.issuer.address === eventData.newAssetIssuer)
      {
        this.lastAddedAsset = asset;
        this.duplicateAsset = null;
        break;
      }
    }
  }

  public highlightDuplicateAsset(eventData: { assetCode: string, assetIssuer: string }): void {
    this.duplicateAsset = eventData.assetCode + "-" + eventData.assetIssuer;
    this.lastAddedAsset = null;
  }
}
