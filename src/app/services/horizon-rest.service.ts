import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from "rxjs/operators";
import { Observable } from 'rxjs';

import { Asset, KnownAssets } from '../model/asset.model';
import { AssetData } from '../model/asset-data.model';
import { ExchangePair } from '../model/exchange-pair.model';
import { Trade } from '../model/trade.model';


@Injectable({
    providedIn: 'root'
})
export class HorizonRestService {
    private readonly API_URLS = [ "https://horizon.stellar.org", "https://horizon.stellar.coinqvest.com" ];

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

    /** Get latest price of given asset in XLM */
    getLastPriceInNative(asset: Asset): Observable<number> {
        const dummyExchange = new ExchangePair("temp", asset, KnownAssets.XLM);
        return this.getTradeHistory(dummyExchange, 1).pipe(
            map<any, number>(data => {
                if (typeof(data) === "string") {
                    data = JSON.parse(data);
                }
                const trades = data._embedded.records;
                if (!trades.length) {
                    return -1;
                }
                //Only consider last trade not older than 24 hours
                const lastTradeTime = new Date(trades[0].ledger_close_time);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastTradeTime < yesterday) {
                    return -1;
                }
                return trades[0].price.n / trades[0].price.d;
            }))
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

    /** Stream orderbook for given exchange pair. Fresh data are pushed on each update of the orderbook. */
    streamOrderbook(exchange: ExchangePair, maxItems: number = 17): Observable<Object> {
        const url = this.getApiUrl() + "/order_book?" + exchange.baseAsset.ToUrlParameters("selling") +
                    "&" + exchange.counterAsset.ToUrlParameters("buying") + "&limit=" + maxItems + "&cursor=now";

        return new Observable<Object>(obs => {
            const es = new EventSource(url);
            es.addEventListener('message', (evt: MessageEvent) => {
                const bookData: Object = JSON.parse(evt.data);
                obs.next(bookData);
            });
            return () => es.close();
        });
    }

    /** Get current orderbook for given exchange in one request. */
    getOrderbook(exchange: ExchangePair, maxItems: number = 17): Observable<Object> {
        const url = this.getApiUrl() + "/order_book?" + exchange.baseAsset.ToUrlParameters("selling") +
                    "&" + exchange.counterAsset.ToUrlParameters("buying") + "&limit=" + maxItems;

        const response = this.http.get(url);
        return response;
    }

    /** Get first 200 anchors issuing given asset */
    getAssetIssuers(assetCode: string): Observable<AssetData[]> {
        const horizonUrl = this.getApiUrl();
        const url = horizonUrl + `/assets?asset_code=${assetCode}&limit=200`;

        return this.http.get<string>(url).pipe(map<any, AssetData[]>(data => {
            if (typeof(data) == "string") {
                data = JSON.parse(data);
            }
            if (!data._embedded || !data._embedded.records || data._embedded.records.length === 0) {
                return null;
            }

            const assetData = new Array<AssetData>();
            for(let record of data._embedded.records) {
                assetData.push(new AssetData(record._links.toml.href, record.asset_type, record.asset_code, record.asset_issuer, record.num_accounts));
            }
            return assetData;
        }));
    }

    /**
     * Get URL of issuer configuration (usually a TOML file) containing given asset definition
     */
    getIssuerConfigUrl(assetCode: string, assetIssuer: string) : Observable<string> {
        const horizonUrl = this.getApiUrl();
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
