import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from 'rxjs';

import { ExchangePair } from '../model/exchange-pair.model';
import { Trade } from '../model/trade.model';


@Injectable({
    providedIn: 'root'
})
export class HorizonRestService {
    private readonly API_URLS = [ "https://horizon.stellar.org", "https://horizon-mon.stellar-ops.com" ];

    constructor(private http: HttpClient) { }


    private getApiUrl(): string {
        const random = (new Date()).getTime() % this.API_URLS.length;
        return this.API_URLS[random];
    }


    /**
     * Retrieve trade history in form of OHLC candles for given exchange.
     * @param exchange exchange pair to get the aggregation for
     * @param interval candle size in milliseconds (e.g. 300000 for 5 minutes, 900000 for 15 minutes etc.)
     * @param maxCandles max. records to return. Must not exceed 200 as that's current limit supported by Horizon
     */
    getTradeAggregations(exchange: ExchangePair, interval: number, maxCandles: number = 96) : Observable<Object> {
        const url = this.getApiUrl() + "/trade_aggregations?" +
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
    getTradeHistory(exchange: ExchangePair, maxItems: number = 40): Observable<Object> {
        const url = this.getApiUrl() + "/trades?" + exchange.baseAsset.ToUrlParameters("base") +
                    "&" + exchange.counterAsset.ToUrlParameters("counter") + "&order=desc&limit=" + maxItems;

        const response = this.http.get(url);
        return response;
    }

    /** Stream current trades without limitations on assets */
    streamTradeHistory(): Observable<Trade> {
        const url = this.getApiUrl() + "/trades?cursor=now&order=asc";
        return new Observable<Trade>(obs => {
            const es = new EventSource(url);
            es.addEventListener('message', (evt: MessageEvent) => {
                const trade: Trade = JSON.parse(evt.data) as Trade;
                obs.next(trade);
            });
            return () => es.close();
        });
    }

    getOrderbook(exchange: ExchangePair, maxItems: number = 17): Observable<Object> {
        const url = this.getApiUrl() + "/order_book?" + exchange.baseAsset.ToUrlParameters("selling") +
                    "&" + exchange.counterAsset.ToUrlParameters("buying") + "&limit=" + maxItems;

        const response = this.http.get(url);
        return response;
    }

    /**
     * Get URL of issuer configuration (usually a TOML file) containing given asset definition
     */
    getIssuerConfigUrl(assetCode: string, assetIssuer: string) : Observable<string> {
        const horizonUrl = this.API_URLS[0];   //TODO: this is awkward but the endpoint doesn't work on horizon-mon. We need more reliable Horizon servers
        const url = horizonUrl + `/assets?asset_code=${assetCode}&asset_issuer=${assetIssuer}`;

        return this.http.get<string>(url).pipe(map<any, string>(data => {
            if (typeof(data) == "string") {
                data = JSON.parse(data);
            }
            if (data._embedded && data._embedded.records && data._embedded.records.length) {
                return data._embedded.records[0]._links.toml.href;
            }
            else return null;
        }));
    }
}
