import { HttpErrorResponse } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { KnownAssets, Asset } from '../model/asset.model';
import { Offer, Orderbook } from '../model/orderbook.model';
import { OrderbookComponent } from './orderbook.component';


describe('OrderbookComponent', () => {
    let component: OrderbookComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: HorizonRestService, useClass: HorizonSericeStub }
            ]
        })
        .compileComponents();
    });

    beforeEach(inject([HorizonRestService], (horizonService) => {
        component = new OrderbookComponent(horizonService);
    }));

    it('should create instance', () => {
        expect(component).toBeTruthy();
        expect(component.orderbook).toEqual(new Orderbook());
    });

    it("starts orderbook stream with ngInit, stops it with ngDestroy", () => {
        component.exchange = new ExchangePair("empty", KnownAssets.XLM, KnownAssets.TERN);
        const horizonStub = TestBed.get(HorizonRestService);

        spyOn(horizonStub, "streamOrderbook").and.callThrough();
        component.ngOnInit();
        component.ngOnDestroy();
        expect(horizonStub.streamOrderbook).toHaveBeenCalledWith(component._exchange);
    });

    it("sets error message if orderbook stream fails", () => {
        component.exchange = new ExchangePair("stream-error", KnownAssets.XLM, KnownAssets.EURT);

        component.ngOnInit();

        expect(component.dataStatus).toBe(DataStatus.Error);
        expect(component.message).toBe("Error loading order book (server: Database is slow - server overload [531])");
    });

    it("assigning [exchange]=XLM/GTN retrieves orderbook", () => {
        component.exchange = new ExchangePair("XLM/GTN", KnownAssets.XLM, KnownAssets.MOBI);

        component.ngOnInit();

        expect(component._exchange.baseAsset.code).toBe("XLM");
        expect(component._exchange.counterAsset.issuer.address).toBe(KnownAssets.MOBI.issuer.address);
        expect(component.orderbook.bids).toEqual([
            new Offer(5524.861878453039, 41.580660600011896, 41.580660600011896, false),
            new Offer(5263.1578947368425, 0.8047200000089999, 41.580660600011896 + 0.8047200000089999, false)
        ]);
        expect(component.orderbook.asks).toEqual([
            new Offer(5617.9775280898875, 0.0000001, 0.0000001, false),
            new Offer(5882.35294117647, 1.6199, 1.6199001, false)
        ]);
        expect(component.maxCumulativeAmount).toBe(42.385380600020895);
        expect(component.dataStatus).toBe(DataStatus.OK);
    });

    it("exchange CNY-RippleFox/XCN-Firefly retrieves orderbook with auto-linked offers", () => {
        component.exchange = new ExchangePair("CNY/XCN", KnownAssets["CNY-RippleFox"], KnownAssets.XCN);

        component.ngOnInit();

        expect(component._exchange.counterAsset.code).toBe("XCN");
        expect(component.orderbook.bids).toEqual([
            new Offer(1.001, 1050.768194705295, 1050.768194705295, false),
            new Offer(1.000511, 2672.8614465008386, 3723.629641206134, false),
            new Offer(1.0005000499249526, 99326.53464270612, 103050.16428391225, false),
            new Offer(1.0080645161290323, 1199.9999999999998, 104250.16428391225, true)
        ]);
        expect(component.orderbook.asks).toEqual([
            new Offer(1.002, 447.7333038, 447.7333038, false),
            new Offer(1.003, 8052.7899, 8500.5232038, false),
            new Offer(1.0035180781646635, 1202.1877218379752, 9702.710925637975, true),
            new Offer(1.005, 2989.537364, 12692.248289637975, false)
        ]);
    });

    it("fail to load base side of auto-linked offers creates orderbook without them", () => {
        component.exchange = new ExchangePair("ASSET1-error", KnownAssets.XCN, new Asset("ERROR1", "should throw", null, null));

        component.ngOnInit();

        expect(component._exchange.baseAsset.code).toBe("XCN");
        expect(component._exchange.counterAsset.code).toBe("ERROR1");
        expect(component.orderbook.bids).toEqual([
            new Offer(1.001, 1050.768194705295, 1050.768194705295, false),
            new Offer(1.000511, 2672.8614465008386, 3723.629641206134, false),
            new Offer(1.0005000499249526, 99326.53464270612, 103050.16428391225, false)
        ]);
        expect(component.orderbook.asks).toEqual([
            new Offer(1.002, 447.7333038, 447.7333038, false),
            new Offer(1.003, 8052.7899, 8500.5232038, false),
            new Offer(1.005, 2989.537364, 11490.0605678, false)
        ]);
    });

    it("fail to load counter side of auto-linked offers creates orderbook without them", () => {
        component.exchange = new ExchangePair("ASSET2-error", new Asset("ERROR2", "should throw", null, null), KnownAssets["CNY-RippleFox"]);

        component.ngOnInit();

        expect(component._exchange.baseAsset.code).toBe("ERROR2");
        expect(component._exchange.counterAsset.code).toBe("CNY");
        expect(component.orderbook.bids).toEqual([
            new Offer(1.001, 1050.768194705295, 1050.768194705295, false),
            new Offer(1.000511, 2672.8614465008386, 3723.629641206134, false),
            new Offer(1.0005000499249526, 99326.53464270612, 103050.16428391225, false)
        ]);
        expect(component.orderbook.asks).toEqual([
            new Offer(1.002, 447.7333038, 447.7333038, false),
            new Offer(1.003, 8052.7899, 8500.5232038, false),
            new Offer(1.005, 2989.537364, 11490.0605678, false)
        ]);
    });

    it("#getRowStyle with offer type 'ask' highlights red", () => {
        const offer = new Offer(17.1, 100, 17400);
        component.maxCumulativeAmount = 123456;

        const cssDef = component.getRowStyle(offer, "ask");

        expect(cssDef).toEqual({ background: "linear-gradient(to right, #FAD9B9 14.1%, rgba(255,255,255,0) 14.1%)" });
    });

    it("#getRowStyle with offer type 'bid' highlights green", () => {
        const offer = new Offer(0.5388, 0.7, 256);
        component.maxCumulativeAmount = 500.8;

        const cssDef = component.getRowStyle(offer, "bid");

        expect(cssDef).toEqual({ background: "linear-gradient(to right, #C8E8C8 51.1%, rgba(255,255,255,0) 51.1%)" });
    });
});


class HorizonSericeStub {
    getOrderbook(exchange: ExchangePair): Observable<Object> {
        if ("XLM-CNY" === exchange.id) {
            const data = {
                "bids": [
                    {
                        "price_r": { "n": 5000000, "d": 2668931 },
                        "price": "1.8734092",
                        "amount": "27449.0111470"
                    },
                    {
                        "price_r": { "n": 187, "d": 100 },
                        "price": "1.8700000",
                        "amount": "13.4120668"
                    }
                ],
                "asks": [
                    {
                        "price_r": { "n": 15, "d": 8 },
                        "price": "1.8750000",
                        "amount": "806.4516127"
                    },
                    {
                        "price_r": { "n": 47, "d": 25 },
                        "price": "1.8800000",
                        "amount": "641.7112299"
                    }
                ]
            };

            return of(data);
        }
        if ("XLM-XCN" === exchange.id) {
            const data = {
                "bids": [
                    {
                        "price_r": { "n": 93, "d": 50 },
                        "price": "1.8600000",
                        "amount": "1200.0000000"
                    },
                    {
                        "price_r": { "n": 18500001, "d": 10000000 },
                        "price": "1.8500001",
                        "amount": "11995.0000000"
                    }
                ],
                "asks": [
                    {
                        "price_r": { "n": 47, "d": 25 },
                        "price": "1.8800000",
                        "amount": "641.7112299"
                    },
                    {
                        "price_r": { "n": 189, "d": 100 },
                        "price": "1.8900000",
                        "amount": "638.2978723"
                    }
                ]
            };
            return of(data);
        }
        if ("XLM-ERROR1" === exchange.id || "XLM-ERROR2" === exchange.id) {
            return throwError(new HttpErrorResponse({
                error: { detail: "Couldn't fetch asset1" },
                statusText: "found but bad",
                status: 470
            }));
        }

        throw `No testing data ready for input exchange ${exchange.baseAsset.code}/${exchange.counterAsset.code}`;
    }

    streamOrderbook(exchange: ExchangePair): Observable<Object> {
        if ("empty" === exchange.id) {
            return of({bids: [], asks: []});
        }
        if ("stream-error" === exchange.id) {
            return throwError(new HttpErrorResponse({
                error: { detail: "Database is slow" },
                statusText: "server overload",
                status: 531
            }));
        }
        if ("XLM/GTN" === exchange.id) {
            const data = {
                "bids": [
                    {
                        "price_r": { n: 1000000, d: 181 },
                        "price": "5524.8618785",
                        "amount": "229727.4066299"
                    },
                    {
                        "price_r": { "n": 100000, d: 19 },
                        "price": "5263.1578947",
                        "amount": "4235.3684211"
                    }
                ],
                "asks": [
                    {
                        "price_r": { "n": 10000000, "d": 1780 },
                        "price": "5617.9775281",
                        "amount": "0.0000001"
                    },
                    {
                        "price_r": { n: 100000, "d": 17 },
                        "price": "5882.3529412",
                        "amount": "1.6199000"
                    }
                ]
            };
            return of(data);
        }
        if ("CNY/XCN" === exchange.id || "ASSET1-error" === exchange.id || "ASSET2-error" === exchange.id) {
            const data = {
                "bids": [
                    {
                        "price_r": { "n": 1001, "d": 1000 },
                        "price": "1.0010000",
                        "amount": "1051.8189629"
                    },
                    {
                        "price_r": { "n": 1000511, "d": 1000000 },
                        "price": "1.0005110",
                        "amount": "2674.2272787"
                    },
                    {
                        "price_r": { "n": 5000000, "d": 4997501 },
                        "price": "1.0005000",
                        "amount": "99376.2028689"
                    }
                ],
                "asks": [
                    {
                        "price_r": { "n": 501, "d": 500 },
                        "price": "1.0020000",
                        "amount": "447.7333038"
                    },
                    {
                        "price_r": { "n": 1003, "d": 1000 },
                        "price": "1.0030000",
                        "amount": "8052.7899000"
                    },
                    {
                        "price_r": { "n": 201, "d": 200 },
                        "price": "1.0050000",
                        "amount": "2989.5373640"
                    }
                ]
            };
            return of(data);
        }

        throw `No testing data ready for input exchange with ID ${exchange.id}`;
    }
}