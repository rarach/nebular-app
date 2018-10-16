import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Account } from 'src/app/model/account.model';
import { AssetService } from 'src/app/asset.service';


@Component({
    selector: 'app-custom-issuers',
    templateUrl: './custom-issuers.component.html',
    styleUrls: ['./custom-issuers.component.css']
})
export class CustomIssuersComponent {
    customAnchors: Account[];
    lastAddedAddress: string;
    duplicateAddress: string;

    constructor(private assetService: AssetService) {
        this.customAnchors = this.assetService.customAnchors;
    }

    addAnchor(theForm: NgForm) {
        this.duplicateAddress = null;
        if (theForm.invalid)
        {
            return;
        }
        const issuerAddress = theForm.value.newAnchorAddress.toUpperCase();

        if (this.customAnchors.find(issuer => issuer.address == issuerAddress))
        {
            //The address is already in the list. Highlight the existing item
            this.duplicateAddress = issuerAddress;
            return;
        }

        const issuerName = theForm.value.newAnchorName;
        if (this.assetService.AddCustomAnchor(issuerAddress, issuerName)) {
            this.lastAddedAddress = issuerAddress;
            theForm.reset();
//TODO?            setupAnchorDropDown();
        }
    }

    removeCustomAnchor(anchorAddress: string) {
        if (this.assetService.RemoveCustomAnchor(anchorAddress)) {
//TODO: this should happen automatically in custom-exchanges, right?            setupAnchorDropDown();
        }
    }
}
