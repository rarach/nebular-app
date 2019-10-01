import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Asset } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { Constants } from '../model/constants';
import { DropdownOption } from '../model/dropdown-option';
import { ExchangePair } from '../model/exchange-pair.model';
import { Account } from '../model/account.model';


@Component({
    selector: 'app-custom-exchange',
    templateUrl: './custom-exchange.component.html',
    styleUrls: ['./custom-exchange.component.css']
})
export class CustomExchangeComponent implements OnInit {
    @Input() exchange: ExchangePair;
    @Output() dragStarted = new EventEmitter();

    assetOptions: DropdownOption<Asset>[] = [];
    selectedBaseAsset: DropdownOption<Asset> = null;
    selectedCounterAsset: DropdownOption<Asset> = null;


    constructor(private assetService: AssetService) {
        this.loadAssets();
    }

    ngOnInit() {
        this.setupUi();
    }


    updateExchange(event)
    {
        this.assetService.UpdateCustomExchange(this.exchange.id, this.selectedBaseAsset.value, this.selectedCounterAsset.value);
    }

    removeExchange() {
        this.assetService.RemoveCustomExchange(this.exchange.id);
    }

    startDrag() {
        this.dragStarted.emit(this.exchange);
    }


    private setupUi() {
        //Set selected option in base asset code drop-down
        let baseAssetDdOption: DropdownOption<Asset> = null;
        for (let option of this.assetOptions) {
            if (option.value.code === this.exchange.baseAsset.code && option.value.issuer.address === this.exchange.baseAsset.issuer.address) {
                baseAssetDdOption = option;
                break;
            }
        }

        //We got asset that we don't recognize (most likely zombie asset from cookie)
        if (null === baseAssetDdOption) {
            const assetId: string = this.exchange.baseAsset.code + "-" + this.exchange.baseAsset.issuer.address;
            const lostAsset = new Asset(this.exchange.baseAsset.code, this.exchange.baseAsset.code, null,
                                        new Account(this.exchange.baseAsset.issuer.address, null),
                                        this.exchange.baseAsset.imageUrl ? this.exchange.baseAsset.imageUrl : Constants.UNKNOWN_ASSET_IMAGE);
            baseAssetDdOption = new DropdownOption(lostAsset, this.exchange.baseAsset.code, assetId, lostAsset.imageUrl);
        }
        this.selectedBaseAsset = baseAssetDdOption;

        //Selected counter asset option
        let counterAssetDdOption: DropdownOption<Asset> = null;
        for (let option of this.assetOptions) {
            if (option.value.code === this.exchange.counterAsset.code && option.value.issuer.address === this.exchange.counterAsset.issuer.address) {
                counterAssetDdOption = option;
                break;
            }
        }

        //Unknown counter asset
        if (null === counterAssetDdOption) {
            const assetId: string = this.exchange.counterAsset.code + "-" + this.exchange.counterAsset.issuer.address;
            const lostAsset = new Asset(this.exchange.counterAsset.code, this.exchange.counterAsset.code, null,
                                        new Account(this.exchange.counterAsset.issuer.address, null),
                                        this.exchange.counterAsset.imageUrl ? this.exchange.counterAsset.imageUrl : Constants.UNKNOWN_ASSET_IMAGE);
            counterAssetDdOption = new DropdownOption(lostAsset, this.exchange.counterAsset.code, assetId, lostAsset.imageUrl);
        }
        this.selectedCounterAsset = counterAssetDdOption;
    }

    private loadAssets() {
        for (let asset of this.assetService.getAvailableAssets()) {
            let longName = asset.code;
            if (!asset.IsNative()) {
                longName += "-" + asset.issuer.domain;
            }
            const ddOption = new DropdownOption(asset, longName, asset.fullName, asset.imageUrl);
            this.assetOptions.push(ddOption);
        }
    }
}
