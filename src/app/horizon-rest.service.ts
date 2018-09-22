import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Constants } from './model/constants';
import { ExchangePair } from './model/exchange-pair.model';


@Injectable({
    providedIn: 'root'
})
export class HorizonRestService {

    constructor(private http: HttpClient) { }

    /**
     * Retrieve trade history in form of OHLC candles for given exchange.
     * @param exchange exchange pair to get the aggregation for
     * @param interval candle size in milliseconds (e.g. 300000 for 5 minutes, 900000 for 15 minutes etc.)
     * @param maxCandles max. records to return. Must not exceed 200 as that's current limit supported by Horizon
     */
    getTradeAggregations(exchange: ExchangePair, interval: number, maxCandles: number = 96) : Observable<Object> {
        const url = Constants.API_URL + "/trade_aggregations?" +
                    exchange.baseAsset.ToUrlParameters("base") + "&" + exchange.counterAsset.ToUrlParameters("counter") +
                    "&order=desc&resolution=" + interval + "&limit=" + maxCandles;

        const response = this.http.get(url);
        return response;
    }

    /**
     * Retrieve trade history in descending order (most recent first)
     * @param exchange exchange pair to get the past trades for
     * @param maxItems maximum number of trades to get
     */
    getTradeHistory(exchange: ExchangePair, maxItems: number = 40){
        const url = Constants.API_URL + "/trades?" + exchange.baseAsset.ToUrlParameters("base") +
                    "&" + exchange.counterAsset.ToUrlParameters("counter") + "&order=desc&limit=" + maxItems;

        const response = this.http.get(url);
        return response;
    }

    getOrderbook(exchange: ExchangePair, maxItems: number = 17) {
        const url = Constants.API_URL + "/order_book?" + exchange.baseAsset.ToUrlParameters("selling") +
                    "&" + exchange.counterAsset.ToUrlParameters("buying") + "&limit=" + maxItems;

        const response = this.http.get(url);
        return response;
    }
}
