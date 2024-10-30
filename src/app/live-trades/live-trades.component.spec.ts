import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';

import { Asset } from '../model/asset.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { LiveTradeItem } from './live-trade-item';
import { LiveTradesComponent } from './live-trades.component';
import { TitleStub, TomlConfigServiceStub } from '../testing/stubs';
import { TomlConfigService } from '../services/toml-config.service';
import { Trade } from '../model/trade.model';
import { AssetStatistics } from '../model/asset-statistics';


describe('LiveTradesComponent', () => {
  let component: LiveTradesComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveTradesComponent ],
      providers: [
        { provide: Title, useClass: TitleStub },
        { provide: DestroyRef },
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

  beforeEach(inject([Title, DestroyRef, HorizonRestService, TomlConfigService], (titleService, destroyRef, horizonService, configService) => {
    component = new LiveTradesComponent(titleService, destroyRef, horizonService, configService);
  }));

  it('should have window title "Live Trades"', inject([Title], (titleService) => {
    expect(titleService.title).toBe("Live Trades");
  }));

  it('should contain 5 trades fetched from data API', () => {
    component.ngOnInit();
    expect(component.trades.size).toBe(5);
    const tradesCopy = new Array<LiveTradeItem>();
    for (const trade of component.trades) {
      tradesCopy.push(trade);
    }
    expect(tradesCopy).toContain(jasmine.objectContaining({linkHref: "/exchange/XLM/ASDF-GASDF"}));
    expect(tradesCopy).toContain(jasmine.objectContaining({linkHref: "/exchange/zero-coin-GAZERO/GTN-GBETLEHEM"}));
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
    expect(component.sortedStatistics[0].numTrades).toBe(4);
    expect(component.sortedStatistics[0].volume).toBe(17);
    expect(component.sortedStatistics[0].volumeInNative).toBe(-1 * 858585.8585);
    expect(component.sortedStatistics[1].assetCode).toBe("zero-coin");
    expect(component.sortedStatistics[1].numTrades).toBe(3);
    expect(component.sortedStatistics[1].volume).toBe(7.5);
    expect(component.sortedStatistics[1].volumeInNative).toBe(-1 * 378787.87875);
    expect(component.sortedStatistics[2].assetCode).toBe("ASDF");
    expect(component.sortedStatistics[2].numTrades).toBe(2);
    expect(component.sortedStatistics[2].volume).toBe(17.5);
  });
  it("should order statistics by volume in XLM when sorted by 'volume'", () => {
    component.ngOnInit();
    component.sortStatistics({ active: "volume", direction: "asc"});

    expect(component.sortedStatistics.length).toBe(3);  //XLM must not be there
    expect(component.sortedStatistics[0].assetCode).toBe("GTN");
    expect(component.sortedStatistics[0].numTrades).toBe(4);
    expect(component.sortedStatistics[0].volume).toBe(17);
    expect(component.sortedStatistics[0].volumeInNative).toBe(-1 * 858585.8585);
    expect(component.sortedStatistics[1].assetCode).toBe("zero-coin");
    expect(component.sortedStatistics[1].numTrades).toBe(3);
    expect(component.sortedStatistics[1].volume).toBe(7.5);
    expect(component.sortedStatistics[1].volumeInNative).toBe(-1 * 378787.87875);
    expect(component.sortedStatistics[2].assetCode).toBe("ASDF");
    expect(component.sortedStatistics[2].numTrades).toBe(2);
    expect(component.sortedStatistics[2].volume).toBe(17.5);
    expect(component.sortedStatistics[2].volumeInNative).toBe(388.88500000000005);
  });
  it("should not order statistics when sort direction is not given", () => {
    component.ngOnInit();
    component.sortStatistics({ active: "sunlight", direction: "asc"});

    expect(component.sortedStatistics.length).toBe(3);  //XLM must not be there
    expect(component.sortedStatistics[0].assetCode).toBe("ASDF");
    expect(component.sortedStatistics[0].numTrades).toBe(2);
    expect(component.sortedStatistics[0].volume).toBe(17.5);
    expect(component.sortedStatistics[0].volumeInNative).toBe(388.88500000000005);
    expect(component.sortedStatistics[1].assetCode).toBe("zero-coin");
    expect(component.sortedStatistics[1].numTrades).toBe(3);
    expect(component.sortedStatistics[1].volume).toBe(7.5);
    expect(component.sortedStatistics[1].volumeInNative).toBe(-1 * 378787.87875);
    expect(component.sortedStatistics[2].assetCode).toBe("GTN");
    expect(component.sortedStatistics[2].numTrades).toBe(4);
    expect(component.sortedStatistics[2].volume).toBe(17.0);
    expect(component.sortedStatistics[2].volumeInNative).toBe(-1 * 858585.8585);
  });

  it("addAssetToBlacklist should add specific asset to black-list", () => {
    //arrange
    const assetToBlacklist = { id: "KRW-GENIUS55555", hidden: false } as AssetStatistics;
    expect(component.directAssetBlacklist.has(assetToBlacklist.id)).toBeFalse();

    //act
    component.addAssetToBlacklist(assetToBlacklist);

    //assert
    expect(assetToBlacklist.hidden).toBeTrue();
    expect(component.directAssetBlacklist.has(assetToBlacklist.id)).toBeTrue();
  });
  
  it("removeAssetFromBlacklist should remove specific asset from black-list and un-hide it", () => {
    //arrange
    const assetToBlacklist = { id: "KRW-GENIUS55555", hidden: false } as AssetStatistics;
    component.directAssetBlacklist.set(assetToBlacklist.id, assetToBlacklist);

    //act
    component.removeAssetFromBlacklist(assetToBlacklist);

    //assert
    expect(assetToBlacklist.hidden).toBeFalse();
    expect(component.directAssetBlacklist.has(assetToBlacklist.id)).toBeFalse();
  });
  
  it("removeAssetFromBlacklist should keep asset hidden if it's also filtered out by text", () => {
    //arrange
    const assetToBlacklist = { id: "KRW-GENIUS55555", hidden: true } as AssetStatistics;
    component.directAssetBlacklist.set(assetToBlacklist.id, assetToBlacklist);
    component.impliedAssetBlacklist.set(assetToBlacklist.id, assetToBlacklist);

    //act
    component.removeAssetFromBlacklist(assetToBlacklist);

    //assert
    expect(assetToBlacklist.hidden).toBeTrue();
    expect(component.directAssetBlacklist.has(assetToBlacklist.id)).toBeFalse();
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
        } as Trade,
        {
          id: "trade-05",
          base_is_seller: false,
          base_asset_type: "alphanum4",
          base_asset_code: "ASDF",
          base_asset_issuer: "GASDF",
          base_amount: "14.50",
          counter_asset_type: "alphanum4",
          counter_asset_code: "GTN",
          counter_asset_issuer: "GBETLEHEM",
          counter_amount: "2",
          price: { n: 888, d: 20202 }
        } as Trade
  ];

  streamTradeHistory(): Observable<Trade> {
    return new Observable<Trade>(obs => {
      for (const trade of this.fakeTrades) {
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
