import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';

import { Account } from '../model/account.model';
import { ActivatedRouteStub } from '../testing/activated-route-stub';
import { Asset, KnownAssets } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { Constants } from '../model/constants';
import { DataStatus } from '../model/data-status.enum';
import { ExchangeComponent } from './exchange.component';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { TitleStub } from '../testing/stubs';


describe('ExchangeComponent', () => {
    let exchComponent: ExchangeComponent;
    let activRoute: ActivatedRouteStub;

    beforeEach(() => {
        activRoute = new ActivatedRouteStub();
        TestBed.configureTestingModule({
            providers: [
                { provide: ActivatedRoute, useValue: activRoute },
                { provide: Router, useClass: RouterStub },
                { provide: Title, useClass: TitleStub },
                { provide: AssetService, useClass: AssetServiceStub },
                { provide: HorizonRestService, useClass: HorizonRestServiceStub }
            ]
        })
        .compileComponents();
    });
    beforeEach(inject([NgZone, ActivatedRoute, Router, Title, AssetService, HorizonRestService],
                      (zone, route, router, titleService, assetService, horizonRestService) => {
        exchComponent = new ExchangeComponent(zone, route, router, titleService, assetService, horizonRestService);
    }));

    it('should have a default chart message "Loading chart..."', () => {
        expect(exchComponent.chartMessage).toBe("Loading chart...");
    });
    it("should display error message when base asset is missing in URL", () => {
        exchComponent.exchange = new ExchangePair("test01", KnownAssets.XLM, KnownAssets["ETH-fchain"]);
        exchComponent.ngOnInit();
        expect(exchComponent.dataStatus).toBe(DataStatus.Error);
        expect(exchComponent.chartMessage).toBe("Invalid URL: missing base asset");
        //How come we don't have to reset timer we started in ngOnInit?
    });
    it("should display error message when counter asset is missing in URL", () => {
        activRoute.setParamMap({ baseAssetId: "XLM" });
        exchComponent.exchange = new ExchangePair("test02", KnownAssets.ABDT, KnownAssets.XCN);
        exchComponent.ngOnInit();
        expect(exchComponent.dataStatus).toBe(DataStatus.Error);
        expect(exchComponent.chartMessage).toBe("Invalid URL: missing counter asset");
    });
    it("should initialize exchange from URL parameters - know asset", () => {
        activRoute.setParamMap({ baseAssetId: "XLM", counterAssetId: "XYZ-GAGALADY", interval: "1hour" });
        expect(exchComponent.dataStatus).toBe(DataStatus.OK);
        exchComponent.ngOnInit();
        expect(exchComponent.exchange.baseAsset.code).toBe("XLM");
        expect(exchComponent.chartInterval).toBe(3600000);
        //Code coverage...
        exchComponent.ngOnDestroy();
    });
    it("should initialize exchange from URL parameters - unknow asset", () => {
        activRoute.setParamMap({ baseAssetId: "BBQ-GRILLED", counterAssetId: "UUUUH-G0000AASFJGSFG56ADS", interval: "900000" });
        expect(exchComponent.dataStatus).toBe(DataStatus.OK);
        exchComponent.ngOnInit();
        expect(exchComponent.exchange.baseAsset.code).toBe("BBQ");
        expect(exchComponent.exchange.counterAsset.issuer.address).toBe("G0000AASFJGSFG56ADS");
        expect(exchComponent.chartInterval).toBe(900000);
    });

    it("#swapAssets() should swap the assets in URL", () => {
        const router = TestBed.inject(Router);
        const routerSpy = spyOn(router, "navigateByUrl");
        exchComponent.exchange = new ExchangePair("test01", KnownAssets.MOBI, KnownAssets.XLM);

        exchComponent.swapAssets();
        expect(routerSpy).toHaveBeenCalledWith("exchange/XLM/MOBI-GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH?interval=900000");
    });

    it("#setChartInterval() should set correct chart interval", () => {
        const router = TestBed.inject(Router);
        const urlTreeStub = {
            toString: () => 'https://www.google.com'
        } as UrlTree;
        const routerSpy = spyOn(router, "createUrlTree").and.returnValue(urlTreeStub);
        exchComponent.chartMessage = "whatever";

        exchComponent.setChartInterval("1w");
        expect(exchComponent.chartMessage).toBe("Loading chart...");
        expect(exchComponent.chartInterval).toBe(604800000);
        expect(routerSpy).toHaveBeenCalled();
    });

    it("#renderCandlestickChart() isn't called if the component is not active", () => {
        const horizon = TestBed.inject(HorizonRestService);
        const horizonSpy = spyOn(horizon, "getTradeAggregations");

        exchComponent.initChartStream();

        //Lame but best way to check that renderCandlestickChart wasn't called
        expect(horizonSpy).not.toHaveBeenCalled();
    });

    it("should initialize exchange from URL parameters - no trade history", () => {
        activRoute.setParamMap({ baseAssetId: "ASDF-GAAARGSAD0451", counterAssetId: "CCCP-G0PYNUGNNNNN", interval: "900000" });
        const titleService = TestBed.inject(Title);
        spyOn(titleService, "setTitle");

        exchComponent.ngOnInit();
        expect(exchComponent.dataStatus).toBe(DataStatus.NoData);
        expect(exchComponent.chartMessage).toBe("No trades in this exchange");
        expect(titleService.setTitle).toHaveBeenCalledWith("ASDF/CCCP");
        expect(exchComponent.lastTradeTime).toBeNull();
    });

    it("should initialize exchange - last trade too old", () => {
        activRoute.setParamMap({ baseAssetId: "OLD-GCCFGS486G5ADFG51A", counterAssetId: "CCCP-G0PYNUGNNNNN", interval: "300000" });

        exchComponent.ngOnInit();
        expect(exchComponent.dataStatus).toBe(DataStatus.NoData);
        expect(exchComponent.chartMessage).toBe("No trades in last 1 days");
        expect(exchComponent.lastTradeType).toBe("sell");
    });

    it("should initialize exchange", () => {
        activRoute.setParamMap({ baseAssetId: "CUS-GBDEV84512", counterAssetId: "CCCP-G0PYNUGNNNNN", interval: "3600000" });
        const jQuerySpy = spyOn($.fn, 'text').and.stub();

        exchComponent.ngOnInit();
        expect(exchComponent.dataStatus).toBe(DataStatus.OK);
        expect(exchComponent.chartMessage).toBe("");
        expect(jQuerySpy).toHaveBeenCalledTimes(10);    //5 for given candle, 5 for added artificial candle
        expect(jQuerySpy).toHaveBeenCalledWith('open: 99.4846694');
        expect(jQuerySpy).toHaveBeenCalledWith('high: 99.4955575');
        expect(jQuerySpy).toHaveBeenCalledWith('low: 99.4846694');
        expect(jQuerySpy).toHaveBeenCalledWith('close: 99.4955575');
        expect(jQuerySpy).toHaveBeenCalledWith('volume: 64.9569426');
    });

    it("should show error message when failed to get candle data", () => {
        activRoute.setParamMap({ baseAssetId: "ERROR-GOTOHELL", counterAssetId: "CCCP-G0PYNUGNNNNN", interval: "300000" });

        exchComponent.ngOnInit();
        expect(exchComponent.dataStatus).toBe(DataStatus.Error);
        expect(exchComponent.chartMessage).toBe("Couldn't load data for this exchange (server: Resource not found on a computer - that's bad [404])");
        expect(exchComponent.lastPrice).toBe(-1);
        expect(exchComponent.lastTradeType).toBe("error");
    });
    //TODO: and so on (after we finish refactoring to one drop-down per asset)
});

class RouterStub {
    navigateByUrl(url: string) { }
    createUrlTree(a: any, b: any) { }
}

class AssetServiceStub {
    public getAsset(assetId: string): Asset {
        if (Constants.NATIVE_ASSET_CODE === assetId) {
            return KnownAssets.XLM;
        }
        if ('ASDF-GAAARGSAD0451' === assetId) {
            return new Asset('ASDF', null, null, null);
        }
        if ('BBQ-GRILLED' === assetId) {
            return new Asset('BBQ', null, null, null);
        }
        if ('ERROR-GOTOHELL' === assetId) {
            return new Asset('ERROR', null, null, null);
        }
        if ('CUS-GBDEV84512' === assetId) {
            return new Asset('CUS', null, null, new Account('GBDEV84512'));
        }
        if ('OLD-GCCFGS486G5ADFG51A' === assetId) {
            return new Asset('OLD', null, null, new Account('GCCFGS486G5ADFG51A'));
        }
        throw new Error('No test asset data prepared for assetId=' + assetId);
    }

    public get availableAssets(): Asset[] {
        return new Array<Asset>();
    }

    getAssetCodesForExchange(): string[] {      //mm-TODO: delete + all the other zombies after the change
        return [ "XLM", "XYZ" ];
    }

    GetIssuersByAssetCode(assetCode: string): Account[] {
        return [];
    }

    GetIssuerByAddress(address: string): Account {
        return null;
    }
}

class HorizonRestServiceStub {
    getTradeHistory(exchange: ExchangePair, maxItems: number): Observable<Object> {
        if ("ASDF" === exchange.baseAsset.code) {       //Unknown asset
            return of({
                _embedded: {
                    records: []
                }
            });
        }
        if ("OLD" === exchange.baseAsset.code) {        //Last trade too old
            return of({
                _embedded: {
                    records: [{
                        ledger_close_time: 1534543200000,   //2018-08-18
                        "price": {
                            n: 200,
                            d: 666
                        },
                        "base_is_seller": false
                    }]
                }
            });
        }
        if ("CUS" === exchange.baseAsset.code) {
            return of({
                _embedded: {
                    records: [{
                        "ledger_close_time": (new Date()).getTime(),
                        timestamp: (new Date()).getTime(),
                        price: {
                            n: 10,
                            d: 3
                        },
                        base_amount: 100,
                        "base_is_seller": true
                    },
                    {
                        ledger_close_time: (new Date()).getTime(),
                        "timestamp": (new Date()).getTime(),
                        price: {
                            "n": 10,
                            d: 4
                        },
                        "base_amount": 7,
                        base_is_seller: false
                    },
                    {
                        ledger_close_time: (new Date()).getTime(),
                        "timestamp": 1534543200000      //2018-08-18
                    }]
                }
            });
        }
        if (exchange.baseAsset.code === "ERROR") {
            return throwError(() => new HttpErrorResponse({
                error: { detail: "This server won't give us trade history" },
                statusText: "wrong",
                status: 429
            }));
        }

        return new Observable<Object>();
    }

    getTradeAggregations(exchange: ExchangePair, interval: number, maxCandles: number): Observable<Object> {
        if ("ASDF" === exchange.baseAsset.code) {       //Unknown asset
            return of({
                _embedded: {
                    records: []
                }
            });
        }
        if ("OLD" === exchange.baseAsset.code) {        //Last trade too old
            return of({
                _embedded: {
                    records: [{
                        timestamp: 1534543200000    //2018-08-18
                    }]
                }
            });
        }
        if ("CUS" === exchange.baseAsset.code) {
            return of({
                _embedded: {
                    records: [{
                        timestamp: (new Date()).getTime(),
                        "base_volume": "64.9569426",
                        "high": "99.4955575",
                        "low": "99.4846694",
                        "open": "99.4846694",
                        "close": "99.4955575"
                    },
                    {
                        timestamp: 1534543200000    //2018-08-18
                    }]
                }
            });
        }
        if (exchange.baseAsset.code === "ERROR") {
            return throwError(() => new HttpErrorResponse({
                error: { detail: "Resource not found on a computer" },
                statusText: "that's bad",
                status: 404
            }));
        }

        return new Observable<Object>();
    }

    getOrderbook(): Observable<Object> {
        return new Observable<Object>();
    }
}