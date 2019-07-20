import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Asset } from 'src/app/model/asset.model';
import { AssetData } from 'src/app/model/asset-data.model';
import { HorizonRestService } from 'src/app/services/horizon-rest.service';


@Component({
  selector: 'app-custom-asset-wizard',
  templateUrl: './custom-asset-wizard.component.html',
  styleUrls: ['./custom-asset-wizard.component.css']
})
export class CustomAssetWizardComponent {
    foundAssets: AssetData[];
    searchStatus: string = null;

    constructor(private horizonService: HorizonRestService) { }

    searchAssetCodes(theForm: NgForm) {
        const assetCode = theForm.value.newAssetCode;
        if (theForm.invalid || (assetCode || "").length <= 0)
        {
            return;
        }

        this.horizonService.getAssetIssuers(assetCode).subscribe(assetsData => {
            //TODO: order by truslines count
            this.foundAssets = assetsData;
            this.searchStatus = "FINISHED";
        });
    }

}
