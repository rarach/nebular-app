import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { HorizonRestService } from '../services/horizon-rest.service';
import { Trade } from '../model/trade.model';
import { Constants } from '../model/constants';
import { Utils } from '../utils';


@Component({
    selector: 'app-live-trades',
    templateUrl: './live-trades.component.html',
    styleUrls: ['./live-trades.component.css']
})
export class LiveTradesComponent implements OnInit, OnDestroy {
    private tradesStream: Subscription;

    items = new Array<LiveTradeItem>();

    constructor(private horizonService: HorizonRestService) { }

    ngOnInit() {
        this.tradesStream = this.horizonService.streamTradeHistory().subscribe(trade => {
            this.items.push(new LiveTradeItem(trade));
        });
    }

    ngOnDestroy() {
        if (this.tradesStream) {
            this.tradesStream.unsubscribe();
        }
    }
}

export class LiveTradeItem {
    public actionName: string;
    public baseAmount: string;
    public baseAssetCode: string;
    public baseLink: string;
    public counterAmount: string;
    public counterAssetCode: string;
    public counterLink: string;
    public note: string;

    constructor(public fromTrade: Trade){
        this.actionName = fromTrade.base_is_seller ? "Sold " : "Bought ";
        this.baseAmount = fromTrade.base_amount;
        this.baseAssetCode = fromTrade.base_asset_code || Constants.NATIVE_ASSET_CODE;
        this.baseLink = Utils.getExchangeUrl(fromTrade.base_asset_code, fromTrade.base_asset_issuer,
                                             fromTrade.counter_asset_code, fromTrade.counter_asset_issuer);
        this.counterAmount = fromTrade.counter_amount;
        this.counterAssetCode = fromTrade.counter_asset_code || Constants.NATIVE_ASSET_CODE;
        this.counterLink = Utils.getExchangeUrl(fromTrade.counter_asset_code, fromTrade.counter_asset_issuer,
                                                fromTrade.base_asset_code, fromTrade.base_asset_issuer);
        this.note = " (price " + Utils.formatPrice(fromTrade.price.n / fromTrade.price.d) + " " + this.counterAssetCode + ")";
    }
}
