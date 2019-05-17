import { async, TestBed, inject } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { Observable, of } from 'rxjs';

import { HorizonRestService } from '../services/horizon-rest.service';
import { LiveTradesComponent } from './live-trades.component';
import { Trade } from '../model/trade.model';
import { Title } from '@angular/platform-browser';
import { TitleStub, TomlConfigServiceStub } from '../testing/stubs';
import { TomlConfigService } from '../services/toml-config.service';
import { Asset } from '../model/asset.model';


describe('LiveTradesComponent', () => {
    let component: LiveTradesComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ LiveTradesComponent ],
            providers: [
                { provide: Title, useClass: TitleStub },
                { provide: HorizonRestService, useClass: HorizonRestServiceStub },
                { provide: TomlConfigService, useValue: new TomlConfigServiceStub(`[[CURRENCIES]]
code = "zero-coin"
desc = "a test token"
display_decimals = 2
issuer = "GAZERO"
name = "O test token"
[[CURRENCIES]]
code = "ASDF"
desc = "another test token"
display_decimals = 2
issuer = "GASDF"
name = "asdf cash"
[[CURRENCIES]]
code = "GTN"
desc = "glitz koin"
display_decimals = 4
issuer = "GBETLEHEM"
name = "glance token (or something)"`) }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([NgZone, Title, HorizonRestService, TomlConfigService], (zone, titleService, horizonService, configService) => {
        component = new LiveTradesComponent(zone, titleService, horizonService, configService);
    }));

    it('should have window title "Live Trades"', inject([Title], (titleService) => {
        expect(titleService.title).toBe("Live Trades");
    }));

    it('should contain 2 trades fetched from data API', () => {
        component.ngOnInit();
        expect(component.trades.length).toBe(2);
        expect(component.trades[0].linkHref).toBe("/exchange/zero-coin-GAZERO/GTN-GBETLEHEM");
        expect(component.trades[1].linkHref).toBe("/exchange/XLM/ASDF-GASDF");
    });

    it("should not sort statistics when direction isn't given", () => {
        component.sortStatistics({ active: "trades", direction: "" });
        expect(component.sortedStatistics).toBeNull();
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

    getIssuerConfigUrl(assetCode: string, assetIssuer: string) : Observable<string> {
        return of("asdf.com/stellar.toml");
    }

    getLastPriceInNative(asset: Asset) : Observable<number> {
        if (asset.code === "ASDF") {
            return of(22.222);
        }

        return of(-50505.0505);
    }
}
