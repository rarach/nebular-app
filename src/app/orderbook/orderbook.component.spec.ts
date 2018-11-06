import { async, TestBed, inject } from '@angular/core/testing';
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

    beforeEach(inject([HorizonRestService], (horizonService) => {
        component = new OrderbookComponent(horizonService);
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
    it("assigning [exchange]=XLM/KAVA retrieves orderbook", () => {
        component.exchange = new ExchangePair("XLM/KAVA", KnownAssets.XLM, KnownAssets.KAVA);
        expect(component._exchange.baseAsset.code).toBe("XLM");
        expect(component._exchange.counterAsset.issuer.address).toBe(KnownAssets.KAVA.issuer.address);
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
});


class HorizonSericeStub {
    getOrderbook(exchange: ExchangePair): Observable<Object> {
        if ("empty" === exchange.id) {
            return of({bids: [], asks: []});
        }
        if ("XLM/KAVA" === exchange.id) {
            const data = {
                "bids": [
                    {
                        "price_r": {
                            "n": 1000000,
                            "d": 181
                        },
                        "price": "5524.8618785",
                        "amount": "229727.4066299"
                    },
                    {
                        "price_r": {
                            "n": 100000,
                            "d": 19
                        },
                        "price": "5263.1578947",
                        "amount": "4235.3684211"
                    }
                ],
                "asks": [
                    {
                        "price_r": {
                            "n": 10000000,
                            "d": 1780
                        },
                        "price": "5617.9775281",
                        "amount": "0.0000001"
                    },
                    {
                        "price_r": {
                            "n": 100000,
                            "d": 17
                        },
                        "price": "5882.3529412",
                        "amount": "1.6199000"
                    }
                ]
            };
            return of(data);
        }


        throw `No testing data ready for input exchange ${exchange.baseAsset.code}/${exchange.counterAsset.code}`;
    }
}