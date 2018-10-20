import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Account } from 'src/app/model/account.model';
import { AssetService } from 'src/app/services/asset.service';


@Component({
    selector: 'app-custom-issuers',
    templateUrl: './custom-issuers.component.html',
    styleUrls: ['./custom-issuers.component.css']
})
export class CustomIssuersComponent {
    @Output() issuersChanged = new EventEmitter();
    customAnchors: Account[];
    lastAddedAddress: string;
    duplicateAddress: string;

    constructor(private assetService: AssetService) {
        this.customAnchors = this.assetService.customAnchors;
    }

    addAnchor(theForm: NgForm) {
        this.duplicateAddress = null;
        const issuerAddress:string = theForm.value.newAnchorAddress.toUpperCase();
        if (theForm.invalid || issuerAddress.length === 0)
        {
            return;
        }

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
            this.issuersChanged.emit();
        }
    }

    removeCustomAnchor(anchorAddress: string) {
        if (this.assetService.RemoveCustomAnchor(anchorAddress)) {
            this.issuersChanged.emit();
        }
    }
}
