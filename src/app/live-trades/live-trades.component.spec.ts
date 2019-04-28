import { async, TestBed, inject } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';

import { HorizonRestService } from '../services/horizon-rest.service';
import { LiveTradesComponent } from './live-trades.component';
import { Trade } from '../model/trade.model';
import { Title } from '@angular/platform-browser';
import { TitleStub } from '../testing/stubs';


describe('LiveTradesComponent', () => {
    let component: LiveTradesComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ LiveTradesComponent ],
            providers: [
                { provide: Title, useClass: TitleStub },
                { provide: HorizonRestService, useClass: HorizonRestServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([NgZone, Title, HorizonRestService], (zone, titleService, horizonService) => {
        component = new LiveTradesComponent(zone, titleService, horizonService);
    }));

    it('should have window title "Live Trades"', inject([Title], (titleService) => {
        expect(titleService.title).toBe("Live Trades");
    }));

    it('should contain 2 trades fetched from data API', () => {
        component.ngOnInit();
        expect(component.items.length).toBe(2);
        expect(component.items[0].linkHref).toBe("/exchange/zero-coin-GAZERO/GTN-GBETLEHEM");
        expect(component.items[1].linkHref).toBe("/exchange/XLM/ASDF-GASDF");
    });
});


export class HorizonRestServiceStub {
    public fakeTrades = [
        {
            id: "trade-01",
            base_is_seller: true,
            base_asset_type: "native",
            base_amount: "1.0",
            counter_asset_type: "alphanum4",
            counter_asset_code: "ASDF",
            counter_asset_issuer: "GASDF",
            counter_amount: "123.456",
            price: { n: 1, d: 123.456 }
        } as Trade,
        {
            id: "trade-02",
            base_is_seller: false,
            base_asset_type: "alphanum12",
            base_asset_code: "zero-coin",
            base_asset_issuer: "GAZERO",
            base_amount: "45603860.44",
            counter_asset_type: "alphanum4",
            counter_asset_code: "GTN",
            counter_asset_issuer: "GBETLEHEM",
            counter_amount: "636363",
            price: { n: 555555.555, d: 1000000 }
        } as Trade
    ];

    streamTradeHistory(): Observable<Trade> {
        return new Observable<Trade>(obs => {
            for (let trade of this.fakeTrades) {
                obs.next(trade);
            }
        });
    }
}
