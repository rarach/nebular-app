import { Component, OnInit, Input } from '@angular/core';

import { Account } from '../model/account.model';
import { Asset } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { Constants } from '../model/constants';
import { DropdownOption } from '../model/dropdown-option';
import { ExchangePair } from '../model/exchange-pair.model';
import { UiActionsService } from '../services/ui-actions.service';


@Component({
  selector: 'nebular-custom-exchange',
  templateUrl: './custom-exchange.component.html',
  styleUrls: ['./custom-exchange.component.css']
})
export class CustomExchangeComponent implements OnInit {
    @Input() exchange: ExchangePair;

    assetOptions: DropdownOption<Asset>[] = [];
    selectedBaseAsset: DropdownOption<Asset> = null;
    selectedCounterAsset: DropdownOption<Asset> = null;
    highlightDropTarget = false;


    constructor(private readonly assetService: AssetService, public readonly uiActions: UiActionsService) {
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

    onMouseOver() {
      if (this.uiActions.DraggingExchange !== null && this.uiActions.DraggingExchange.id !== this.exchange.id) {
        this.highlightDropTarget = true;
      }
    }

    onClick(event) {
      event.stopPropagation();

      if (this.uiActions.DraggingExchange !== null) {
        if (this.uiActions.DraggingExchange.id !== this.exchange.id) {
          this.assetService.SwapCustomExchanges(this.exchange, this.uiActions.DraggingExchange);
        }
        //else: Dropped to itself => no relocation
        this.uiActions.draggingFinished();
      }
    }

    startDrag(event) {
      event.stopPropagation();    //Don't mess with onClick()
      this.uiActions.draggingStarted(this.exchange);
    }

    public get isDragged() : boolean {
      return this.uiActions.DraggingExchange !== null && this.uiActions.DraggingExchange.id === this.exchange.id;
    }

    private setupUi() {
      //Set selected option in base asset code drop-down
      let baseAssetDdOption: DropdownOption<Asset> = null;
      for (const option of this.assetOptions) {
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
        const ddText = assetId;     //TODO: we should somehow get domain here instead of address even if user deleted it
        baseAssetDdOption = new DropdownOption(lostAsset, ddText, assetId, lostAsset.imageUrl);
        this.assetOptions.push(baseAssetDdOption);
      }
      this.selectedBaseAsset = baseAssetDdOption;

      //Selected counter asset option
      let counterAssetDdOption: DropdownOption<Asset> = null;
      for (const option of this.assetOptions) {
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
        const ddText = assetId;     //TODO: we should somehow get domain here instead of address even if user deleted it
        counterAssetDdOption = new DropdownOption(lostAsset, ddText, assetId, lostAsset.imageUrl);
        this.assetOptions.push(counterAssetDdOption);
      }
      this.selectedCounterAsset = counterAssetDdOption;
    }

    private loadAssets() {
      for (const asset of this.assetService.availableAssets) {
        let longName = asset.code;
        if (!asset.IsNative()) {
          longName += "-" + asset.issuer.domain;
        }
        const ddOption = new DropdownOption(asset, longName, asset.fullName, asset.imageUrl);
        this.assetOptions.push(ddOption);
      }
    }
}
