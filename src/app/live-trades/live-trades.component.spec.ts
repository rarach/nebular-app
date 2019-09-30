import { async, TestBed, inject } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';

import { Asset } from '../model/asset.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { LiveTradesComponent } from './live-trades.component';
import { TitleStub, TomlConfigServiceStub } from '../testing/stubs';
import { TomlConfigService } from '../services/toml-config.service';
import { Trade } from '../model/trade.model';


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

    it('should contain 4 trades fetched from data API', () => {
        component.ngOnInit();
        expect(component.trades.length).toBe(4);
        expect(component.trades).toContain(jasmine.objectContaining({linkHref: "/exchange/XLM/ASDF-GASDF"}));
        expect(component.trades).toContain(jasmine.objectContaining({linkHref: "/exchange/zero-coin-GAZERO/GTN-GBETLEHEM"}));
        component.ngOnDestroy();    //Ehm... code coverage
    });

    it("should not sort statistics when direction isn't given", () => {
        component.sortStatistics({ active: "trades", direction: "" });
        expect(component.sortedStatistics).toBeNull();
    });
    it("should order statistics by number of executed trades when sorted by 'trades'", () => {
        component.ngOnInit();
        component.sortStatistics({ active: "trades", direction: "desc"});

        expect(component.sortedStatistics.length).toBe(3);  //XLM must not be there
        expect(component.sortedStatistics[0].assetCode).toBe("GTN");
        expect(component.sortedStatistics[0].numTrades).toBe(3);
        expect(component.sortedStatistics[0].volume).toBe(15);
        expect(component.sortedStatistics[0].volumeInNative).toBe(-1 * 757575.7575);
        expect(component.sortedStatistics[1].assetCode).toBe("zero-coin");
        expect(component.sortedStatistics[1].numTrades).toBe(3);
        expect(component.sortedStatistics[1].volume).toBe(7.5);
        expect(component.sortedStatistics[1].volumeInNative).toBe(-1 * 378787.87875);
        expect(component.sortedStatistics[2].assetCode).toBe("ASDF");
        expect(component.sortedStatistics[2].numTrades).toBe(1);
        expect(component.sortedStatistics[2].volume).toBe(3.0);
    });
    it("should order statistics by volume in XLM when sorted by 'volume'", () => {
        component.ngOnInit();
        component.sortStatistics({ active: "volume", direction: "asc"});

        expect(component.sortedStatistics.length).toBe(3);  //XLM must not be there
        expect(component.sortedStatistics[0].assetCode).toBe("GTN");
        expect(component.sortedStatistics[0].numTrades).toBe(3);
        expect(component.sortedStatistics[0].volume).toBe(15);
        expect(component.sortedStatistics[0].volumeInNative).toBe(-1 * 757575.7575);
        expect(component.sortedStatistics[1].assetCode).toBe("zero-coin");
        expect(component.sortedStatistics[1].numTrades).toBe(3);
        expect(component.sortedStatistics[1].volume).toBe(7.5);
        expect(component.sortedStatistics[1].volumeInNative).toBe(-1 * 378787.87875);
        expect(component.sortedStatistics[2].assetCode).toBe("ASDF");
        expect(component.sortedStatistics[2].numTrades).toBe(1);
        expect(component.sortedStatistics[2].volume).toBe(3.0);
        expect(component.sortedStatistics[2].volumeInNative).toBe(66.666);
    });
    it("should not order statistics when sort direction is not given", () => {
        component.ngOnInit();
        component.sortStatistics({ active: "sunlight", direction: "asc"});

        expect(component.sortedStatistics.length).toBe(3);  //XLM must not be there
        expect(component.sortedStatistics[0].assetCode).toBe("ASDF");
        expect(component.sortedStatistics[0].numTrades).toBe(1);
        expect(component.sortedStatistics[0].volume).toBe(3);
        expect(component.sortedStatistics[0].volumeInNative).toBe(66.666);
        expect(component.sortedStatistics[1].assetCode).toBe("zero-coin");
        expect(component.sortedStatistics[1].numTrades).toBe(3);
        expect(component.sortedStatistics[1].volume).toBe(7.5);
        expect(component.sortedStatistics[1].volumeInNative).toBe(-1 * 378787.87875);
        expect(component.sortedStatistics[2].assetCode).toBe("GTN");
        expect(component.sortedStatistics[2].numTrades).toBe(3);
        expect(component.sortedStatistics[2].volume).toBe(15.0);
        expect(component.sortedStatistics[2].volumeInNative).toBe(-1 * 757575.7575);
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
            counter_amount: "3",
            price: { n: 1, d: 123.456 }
        } as Trade,
        {
            id: "trade-02",
            base_is_seller: false,
            base_asset_type: "alphanum12",
            base_asset_code: "zero-coin",
            base_asset_issuer: "GAZERO",
            base_amount: "5",
            counter_asset_type: "alphanum4",
            counter_asset_code: "GTN",
            counter_asset_issuer: "GBETLEHEM",
            counter_amount: "1",
            price: { n: 555555.555, d: 1000000 }
        } as Trade,
        {
            id: "trade-03",
            base_is_seller: false,
            base_asset_type: "alphanum12",
            base_asset_code: "zero-coin",
            base_asset_issuer: "GAZERO",
            base_amount: "0.5",
            counter_asset_type: "alphanum4",
            counter_asset_code: "GTN",
            counter_asset_issuer: "GBETLEHEM",
            counter_amount: "4",
            price: { n: 4, d: 7 }
        } as Trade,
        {
            id: "trade-04",
            base_is_seller: false,
            base_asset_type: "alphanum12",
            base_asset_code: "zero-coin",
            base_asset_issuer: "GAZERO",
            base_amount: "2.0",
            counter_asset_type: "alphanum4",
            counter_asset_code: "GTN",
            counter_asset_issuer: "GBETLEHEM",
            counter_amount: "10",
            price: { n: 888, d: 2 }
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
