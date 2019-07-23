import { async, TestBed, inject } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { OrderbookComponent } from './orderbook.component';
import { HttpErrorResponse } from '@angular/common/http';
import { KnownAssets } from '../model/asset.model';
import { Offer, Orderbook } from '../model/orderbook.model';


describe('OrderbookComponent', () => {
    let component: OrderbookComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: HorizonRestService, useClass: HorizonSericeStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([NgZone, HorizonRestService], (zone, horizonService) => {
        component = new OrderbookComponent(zone, horizonService);
    }));

    it('should create instance', () => {
        expect(component).toBeTruthy();
        expect(component.orderbook).toEqual(new Orderbook());
    });
    it("starts orderbook stream with ngInit, stops it with ngDestroy", () => {
        component._exchange = new ExchangePair("empty", KnownAssets.XLM, KnownAssets.TERN);
        spyOn(component, "fillOrderBook");
        component.ngOnInit();
        component.ngOnDestroy();
        expect(component.fillOrderBook).toHaveBeenCalledTimes(1);
    });
    it("assigning [exchange]=XLM/GTN retrieves orderbook", () => {
        component.exchange = new ExchangePair("XLM/GTN", KnownAssets.XLM, KnownAssets.GTN);
        expect(component._exchange.baseAsset.code).toBe("XLM");
        expect(component._exchange.counterAsset.issuer.address).toBe(KnownAssets.GTN.issuer.address);
        expect(component.orderbook.bids).toEqual([
            new Offer(5524.8618785, 41.580660599658465, 41.580660599658465, false),
            new Offer(5263.1578947, 0.8047200000146331, 41.580660599658465 + 0.8047200000146331, false)
        ]);
        expect(component.orderbook.asks).toEqual([
            new Offer(5617.9775281, 0.0000001, 0.0000001, false),
            new Offer(5882.3529412, 1.6199, 1.6199001, false)
        ]);
        expect(component.maxCumulativeAmount).toBe(42.3853805996731);
    });

    it("exchange CNY-RippleFox/XCN-Firefly retrieves orderbook with auto-linked offers", () => {
        component.exchange = new ExchangePair("CNY/XCN", KnownAssets["CNY-RippleFox"], KnownAssets.XCN);
        expect(component._exchange.counterAsset.code).toBe("XCN");
        expect(component.orderbook.bids).toEqual([
            new Offer(1.001, 1050.768194705295, 1050.768194705295, false),
            new Offer(1.000511, 2672.8614465008386, 3723.629641206134, false),
            new Offer(1.0005, 99326.53959910045, 103050.16924030658, false),
            new Offer(0.9920000000000001, 1219.4328824141517, 104269.60212272074, true)
        ]);
        expect(component.orderbook.asks).toEqual([
            new Offer(1.002, 447.7333038, 447.7333038, false),
            new Offer(1.003, 8052.7899, 8500.5232038, false),
            new Offer(1.0035180781646635, 1202.1877218379752, 9702.710925637975, true),
            new Offer(1.005, 2989.537364, 12692.248289637975, false)
        ]);
    });

    //TODO: the rest 
});


class HorizonSericeStub {
    getOrderbook(exchange: ExchangePair): Observable<Object> {
        if ("empty" === exchange.id) {
            return of({bids: [], asks: []});
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
        if ("CNY/XCN" === exchange.id) {
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


        throw `No testing data ready for input exchange ${exchange.baseAsset.code}/${exchange.counterAsset.code}`;
    }
}