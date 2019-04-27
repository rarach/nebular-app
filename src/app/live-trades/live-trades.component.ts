import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { Title } from '@angular/platform-browser';
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
    private streamStart: Date;

    public duration = "0s";    //TODO: No! Do it as template pipe that gets the timespan as number
    public items = new Array<LiveTradeItem>();

    constructor(titleService: Title, private horizonService: HorizonRestService) {
        titleService.setTitle("Live Trades");
    }

    ngOnInit() {
        this.tradesStream = this.horizonService.streamTradeHistory().subscribe(trade => {
            this.items.splice(0, 0, new LiveTradeItem(trade));
            this.calculateStatistics();
        });
        this.streamStart = new Date();
    }

    ngOnDestroy() {
        if (this.tradesStream) {
            this.tradesStream.unsubscribe();
        }
    }

    private calculateStatistics() {     //TODO: to formatting pipe
        let timeDiff = new Date().getTime() - this.streamStart.getTime();
        const hours = Math.floor(timeDiff / 1000 / 60 / 60);
        timeDiff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(timeDiff / 1000 / 60);
        timeDiff -= minutes * 1000 * 60;
        const seconds = Math.floor(timeDiff / 1000);

        this.duration = "";
        if (hours > 0) {
        this.duration = `${hours}h ${minutes}m`;
        }
        else if (minutes > 0) {
            this.duration = `${minutes}m ${seconds}s`;
        }
        else {
            this.duration = `${seconds}s`;
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

    constructor(fromTrade: Trade){
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
