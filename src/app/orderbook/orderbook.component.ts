import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Constants } from '../model/constants';
import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { KnownAssets } from '../model/asset.model';
import { Orderbook, Offer } from '../model/orderbook.model';
import { Utils } from '../utils';

@Component({
  selector: 'nebular-orderbook',
  templateUrl: './orderbook.component.html',
  styleUrls: ['./orderbook.component.css']
})
export class OrderbookComponent implements OnInit, OnDestroy {

  private _dataStream: Subscription;

  public _exchange: ExchangePair;
  @Input()
  set exchange(exchange: ExchangePair) {
    this._exchange = exchange;
    this.initOrderBookStream();
  }
  @Input() readonly lastPrice: number = 0.0;
  @Input() readonly lastTradeType: string = "";
  @Input() readonly lastTradeTime: Date = null;
  orderbook: Orderbook = new Orderbook();
  maxCumulativeAmount: number;
  DataStatus=DataStatus/*template access*/; Utils = Utils;
  dataStatus: DataStatus = DataStatus.NoData;
  message: string = null;

  constructor(private readonly horizonService: HorizonRestService){}

  public ngOnInit(): void {
    this.dataStatus = DataStatus.NoData;
    this.initOrderBookStream();
  }

  public ngOnDestroy(): void {
    if (this._dataStream) {
      this._dataStream.unsubscribe();
    }
  }


  /** Fetch the baseAsset/XLM order book for cross-linked offers */
  private addCrossLinkedOffers1(originalOrderBook: any) {
    //Query XLM / baseAsset
    const xlmBaseExch = new ExchangePair("XLM-"+this._exchange.baseAsset.code, KnownAssets.XLM, this._exchange.baseAsset);
    this.horizonService.getOrderbook(xlmBaseExch).subscribe(
      success => {
        const data = success as any;
        this.addCrossLinkedOffers2(originalOrderBook, data);
      },
      () => {
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
    const xlmCounterExch = new ExchangePair("XLM-"+this._exchange.counterAsset.code, KnownAssets.XLM, this._exchange.counterAsset);
    this.horizonService.getOrderbook(xlmCounterExch).subscribe(
      success => {
        const data = success as any;
        this.mergeOrderBooks(originalOrderBook, baseAssetOrderBook, data);
      },
      () =>  {
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
            "price_r": { n: price, d: 1 },
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
          "price_r" : { d: price, n: 1 },
          "isCrossLinked" : true
        });
      }
    }
    //Calculate "bids" (selling counterAsset)
    if (baseSideOrderBook.bids.length > 0 && counterSideOrderBook.asks.length > 0) {
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
            "price_r": { n: price, d: 1 },
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
          "price_r": { n: price, d: 1 },
          "isCrossLinked" : true
        });
      }
    }

    this.renderOrderBook(masterOrderBook);
  }

  private renderOrderBook(completeOrderBook: any) {
    let sumBidsAmount = 0.0;
    let sumAsksAmount = 0.0;
    this.orderbook = new Orderbook();

    for (const bid of completeOrderBook.bids) {
      const price: number = bid.price_r.n / bid.price_r.d;
      const amount: number = parseFloat(bid.amount) / price;
      sumBidsAmount += amount;
      const offer = new Offer(price, amount, sumBidsAmount, bid.isCrossLinked);
      this.orderbook.bids.push(offer);
    }
    for (const ask of completeOrderBook.asks) {
      const price: number = ask.price_r.n / ask.price_r.d;
      const amount: number = parseFloat(ask.amount);
      sumAsksAmount += amount;
      const offer = new Offer(price, amount, sumAsksAmount, ask.isCrossLinked);
      this.orderbook.asks.push(offer);
    }

    this.maxCumulativeAmount = Math.max(sumBidsAmount, sumAsksAmount);
  }

  /**
   * Subscribe to order book and render it to table on each update.
   * If none of the assets is native XLM, the order book is enhanced with offers "cross-linked" through XLM, i.e. artificial offers
   * that are calculated from orderbooks of ASSET1/XLM and XLM/ASSET2. This can be useful for some anemic or exotic order books
   * to show that there may be a better deal when going through Lumens.
   * NOTE: due to asynchronous nature of calls, the data has to be fetched in a chain of requests and callbacks as we need
   *       to get the data in specific order.
   */
  private initOrderBookStream() {
    if (this._dataStream) {
      this._dataStream.unsubscribe();
    }

    this._dataStream = this.horizonService.streamOrderbook(this._exchange).subscribe(
      success => {
        const data = success as any;

        if (this._exchange.baseAsset.IsNative() || this._exchange.counterAsset.IsNative()) {
          this.renderOrderBook(data);
        }
        else {
          this.addCrossLinkedOffers1(data);
        }
        this.dataStatus = DataStatus.OK;
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
  public getRowStyle(offer: Offer, offerType: string): { background: string } {
    const percentage = (offer.cummulativeAmount / this.maxCumulativeAmount * 100.0).toFixed(1) + "%";
    const bgColor = offerType === 'ask' ? Constants.Style.LIGHT_RED : Constants.Style.LIGHT_GREEN;
    return { "background": "linear-gradient(to right, " + bgColor + " " + percentage + ", rgba(255,255,255,0) " + percentage + ")"};
  }
}
