import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Constants } from '../model/constants';
import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../horizon-rest.service';
import { Orderbook, Offer } from '../model/orderbook.model';
import { Utils } from '../utils';


@Component({
  selector: 'app-orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./orderbook.component.css']
})
export class OrderbookComponent implements OnInit {
    @Input() readonly exchange: ExchangePair;
    @Input() readonly lastPrice: number = 0.0;
    @Input() readonly lastTradeType: string = "";
    orderbook: Orderbook = new Orderbook();
    maxCumulativeAmount: number;
    DataStatus=DataStatus/*accessibility*/; dataStatus: DataStatus = DataStatus.NoData;
    message: string = "Loading data...";
    Utils = Utils;


    constructor(private readonly horizonService: HorizonRestService){}

    //TODO: Setup stream. Make this refresh when this.exchange changes

    ngOnInit() {
        this.fillOrderBook();
    }


    /**
     * Get order book from Horizon API and render it to table.
     * If none of the assets is native XLM, the order book is enhanced with offers "cross-linked" through XLM, i.e. artificial offers
     * that are calculated from orderbooks of ASSET1/XLM and ASSET2/XLM. This can be useful for some anemic or exotic order books
     * to show that there may be a better deal when going through Lumens.
     * NOTE: due to asynchronous nature of AJAX calls this has to be done as a chain of requests and callbacks as we need
     *       to get the data in specific order.
     */
    fillOrderBook() {
        this.horizonService.getOrderbook(this.exchange).subscribe(
            success => {
                const data = success as any;
                let sumBidsAmount = 0.0;
                let sumAsksAmount = 0.0;
                this.orderbook = new Orderbook();

                if (this.exchange.baseAsset.IsNative() || this.exchange.counterAsset.IsNative()) {
                    for (let bid of data.bids) {
                        const price: number = parseFloat(bid.price);
                        const amount: number = parseFloat(bid.amount) / price;
                        sumBidsAmount += amount;
                        const offer = new Offer(price, amount, sumBidsAmount, Math.random() > 0.8);
                        this.orderbook.bids.push(offer);
                    }
                    for (let ask of data.asks) {
                        const price: number = parseFloat(ask.price);
                        const amount: number = parseFloat(ask.amount);
                        sumAsksAmount += amount;
                        const offer = new Offer(price, amount, sumAsksAmount);
                        this.orderbook.asks.push(offer);
                    }
                }
                else {
                    //TODO: x-linking :-|
                }

                this.maxCumulativeAmount = Math.max(sumBidsAmount, sumAsksAmount);
            },
            error => {
                const errorResponse = error as HttpErrorResponse;
                this.dataStatus = DataStatus.Error;
                this.message = "Error loading order book (server: " +
                                errorResponse.error.detail + " - " + errorResponse.statusText + " [" + errorResponse.status + "])";
            }
        );
    }

    /** Set background of an offer item to visually indicate its volume (amount) relatively to cumulative volume of whole orderbook */
    getRowStyle(offer: Offer, offerType: string) {
        const percentage = (offer.cummulativeAmount / this.maxCumulativeAmount * 100.0).toFixed(1) + "%";
        const bgColor = offerType === 'ask' ? Constants.Style.LIGHT_RED : Constants.Style.LIGHT_GREEN;
        return { "background": "linear-gradient(to right, " + bgColor + " " + percentage + ", rgba(255,255,255,0) " + percentage + ")"};
    }
}
