import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Constants } from '../model/constants';
import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../horizon-rest.service';
import { Orderbook, Offer } from '../model/orderbook.model';
import { Utils } from '../utils';
import { KnownAssets } from '../model/asset.model';


@Component({
    selector: 'app-orderbook',
    templateUrl: './orderbook.component.html',
    styleUrls: ['./orderbook.component.css']
})
export class OrderbookComponent implements OnInit {
    private _exchange: ExchangePair;

    @Input()
    set exchange(exchange: ExchangePair) {
        this._exchange = exchange;
        this.fillOrderBook();
    }
    @Input() readonly lastPrice: number = 0.0;
    @Input() readonly lastTradeType: string = "";
    orderbook: Orderbook = new Orderbook();
    maxCumulativeAmount: number;
    DataStatus=DataStatus/*accessibility*/; dataStatus: DataStatus = DataStatus.NoData;
    message: string = "Loading data...";
    Utils = Utils;


    constructor(private readonly horizonService: HorizonRestService){}

    //TODO: Setup stream

    ngOnInit() { }


    /**
     * Get order book from Horizon API and render it to table.
     * If none of the assets is native XLM, the order book is enhanced with offers "cross-linked" through XLM, i.e. artificial offers
     * that are calculated from orderbooks of ASSET1/XLM and ASSET2/XLM. This can be useful for some anemic or exotic order books
     * to show that there may be a better deal when going through Lumens.
     * NOTE: due to asynchronous nature of AJAX calls this has to be done as a chain of requests and callbacks as we need
     *       to get the data in specific order.
     */
    fillOrderBook() {
        this.horizonService.getOrderbook(this._exchange).subscribe(
            success => {
                const data = success as any;
                this.orderbook = new Orderbook();

                if (this._exchange.baseAsset.IsNative() || this._exchange.counterAsset.IsNative()) {
                    this.renderOrderBook(data);
                }
                else {
                    this.addCrossLinkedOffers1(data);
                }
            },
            error => {
                const errorResponse = error as HttpErrorResponse;
                this.dataStatus = DataStatus.Error;
                this.message = "Error loading order book (server: " +
                                errorResponse.error.detail + " - " + errorResponse.statusText + " [" + errorResponse.status + "])";
            }
        );
    }

    /** Fetch the baseAsset/XLM order book for cross-linked offers */
    private addCrossLinkedOffers1(originalOrderBook: any) {
        //Query XLM / baseAsset
        const xlmBaseExch = new ExchangePair("XLM-ASSET1", KnownAssets.XLM, this._exchange.baseAsset);
        this.horizonService.getOrderbook(xlmBaseExch).subscribe(
            success => {
                const data = success as any;
                this.addCrossLinkedOffers2(originalOrderBook, data);
            },
            error => {
                this.renderOrderBook(originalOrderBook);
            }
        );
    }

    /** Fetch the XLM/counterAsset order book for cross-linked offers */
    private addCrossLinkedOffers2(originalOrderBook: any, baseAssetOrderBook: any) {
        if (null === baseAssetOrderBook) {
            this.renderOrderBook(originalOrderBook);
        }
        //Query XLM / counterAsset
        const xlmCounterExch = new ExchangePair("XLM-ASSET2", KnownAssets.XLM, this._exchange.counterAsset);
        this.horizonService.getOrderbook(xlmCounterExch).subscribe(
            success => {
                const data = success as any;
                this.mergeOrderBooks(originalOrderBook, baseAssetOrderBook, data);
            },
            error =>  {
                this.renderOrderBook(originalOrderBook);
            }
        );
    }

    /** Take original order book, ASSET1/XLM and ASSET2/XLM and merge them adding cross-linked items to the original book. */
    private mergeOrderBooks(masterOrderBook: any, baseSideOrderBook: any, counterSideOrderBook: any) {
        //Do the math for "asks" (selling baseAsset)
        if (baseSideOrderBook.asks.length > 0 && counterSideOrderBook.bids.length > 0) {
            const amount1Xlm = parseFloat(baseSideOrderBook.asks[0].amount);
            const baseBuyPrice = parseFloat(baseSideOrderBook.asks[0].price);       //Sell price of XLM in baseAsset

            let amount2Xlm = parseFloat(counterSideOrderBook.bids[0].amount);
            const counterBuyPrice = parseFloat(counterSideOrderBook.bids[0].price); //Price of XLM in counterAsset
            amount2Xlm /= counterBuyPrice;
            const amount = Math.min(amount1Xlm, amount2Xlm) * baseBuyPrice;
            const price = counterBuyPrice / baseBuyPrice;

            let added = false;
            for (let i=0; i<masterOrderBook.bids.length; i++) {
                const buyPrice = parseFloat(masterOrderBook.bids[i].price);
                if (price > buyPrice) {
                    const newBid = {
                        "amount": amount,
                        "price": price,
                        "isCrossLinked" : true
                    };
                    masterOrderBook.bids.splice(i, 0, newBid);
                    added = true;
                    break;
                }
            }
            //Couldn't place it inside current order book, put it at the end
            if (!added) {
                masterOrderBook.bids.push({
                    "amount": amount,
                    "price" : price,
                    "isCrossLinked" : true
                });
            }
        }
        //Calculate "bids" (selling counterAsset)
        if (baseSideOrderBook.bids.length > 0 && counterSideOrderBook.asks.length > 0) {    //TODO: double-check this fishy condition
            const amount1Xlm = parseFloat(counterSideOrderBook.asks[0].amount);
            const counterBuyPrice = parseFloat(counterSideOrderBook.asks[0].price); //Sell price of XLM in counterAsset

            let amount2Xlm = parseFloat(baseSideOrderBook.bids[0].amount);
            const baseBuyPrice = parseFloat(baseSideOrderBook.bids[0].price);       //Price of XLM in baseAsset
            amount2Xlm /= baseBuyPrice;
            const amount = Math.min(amount1Xlm, amount2Xlm) * baseBuyPrice;
            const price = counterBuyPrice / baseBuyPrice;

            let added = false;
            for (let i=0; i<masterOrderBook.asks.length; i++) {
                const sellPrice = parseFloat(masterOrderBook.asks[i].price);
                if (price < sellPrice) {
                    const newAsk = {
                        "amount": amount,
                        "price": price,
                        "isCrossLinked" : true
                    };
                    masterOrderBook.asks.splice(i, 0, newAsk);
                    added = true;
                    break;
                }
            }
            //Couldn't place it inside current order book, put it at the end
            if (!added) {
                masterOrderBook.asks.push({
                    "amount": amount,
                    "price": price,
                    "isCrossLinked" : true
                });
            }
        }

        this.renderOrderBook(masterOrderBook);
    }

    private renderOrderBook(completeOrderBook: any) {
        let sumBidsAmount = 0.0;
        let sumAsksAmount = 0.0;

        for (let bid of completeOrderBook.bids) {
            const price: number = parseFloat(bid.price);
            const amount: number = parseFloat(bid.amount) / price;
            sumBidsAmount += amount;
            const offer = new Offer(price, amount, sumBidsAmount, bid.isCrossLinked);
            this.orderbook.bids.push(offer);
        }
        for (let ask of completeOrderBook.asks) {
            const price: number = parseFloat(ask.price);
            const amount: number = parseFloat(ask.amount);
            sumAsksAmount += amount;
            const offer = new Offer(price, amount, sumAsksAmount, ask.isCrossLinked);
            this.orderbook.asks.push(offer);
        }

        this.maxCumulativeAmount = Math.max(sumBidsAmount, sumAsksAmount);
    }


    /** Set background of an offer item to visually indicate its volume (amount) relatively to cumulative volume of whole orderbook */
    getRowStyle(offer: Offer, offerType: string) {
        const percentage = (offer.cummulativeAmount / this.maxCumulativeAmount * 100.0).toFixed(1) + "%";
        const bgColor = offerType === 'ask' ? Constants.Style.LIGHT_RED : Constants.Style.LIGHT_GREEN;
        return { "background": "linear-gradient(to right, " + bgColor + " " + percentage + ", rgba(255,255,255,0) " + percentage + ")"};
    }
}
