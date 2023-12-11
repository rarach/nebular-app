import { HttpErrorResponse } from '@angular/common/http';
import { inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { Account } from '../model/account.model';
import { Asset } from '../model/asset.model';
import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { ExchangeThumbnailComponent } from './exchange-thumbnail.component';
import { HorizonRestService } from '../services/horizon-rest.service';
import { UiActionsService } from '../services/ui-actions.service';

describe('ExchangeThumbnailComponent', () => {
  let component: ExchangeThumbnailComponent;
  const exchange = new ExchangePair("asdf123",
    new Asset("ABC", "ABC", null, new Account("GCCCP", null)),
    new Asset("ETH", "ETH", null, new Account("GETH841062WESTHDF", null)));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useClass: RouterStub },
        { provide: HorizonRestService, useClass: HorizonRestServiceStub }
      ]
    })
      .compileComponents();
  });

  beforeEach(inject([Router, HorizonRestService, UiActionsService], (router, horizonService, uiService) => {
    component = new ExchangeThumbnailComponent(router, horizonService, uiService);
    component.exchange = exchange;
  }));

  it("userMessage after init is 'Loading data...'", () => {
    expect(component.userMessage).toBe("Loading data...");
    expect(component.chartPlaceholderId).toBeNull();
  });
  it("getUrl() returns exchange URL", () => {
    const url = component.getUrl();
    expect(url).toBe("exchange/ABC-GCCCP/ETH-GETH841062WESTHDF");
  });
  it("onClick() navigates to exchange URL", () => {
    const uiService : UiActionsService = TestBed.get(UiActionsService);
    spyOnProperty(uiService, "DraggingExchange", "get").and.returnValue(null);
    const router = TestBed.get(Router);
    const routerSpy = spyOn(router, "navigateByUrl");

    component.onClick();
    expect(routerSpy).toHaveBeenCalledWith("exchange/ABC-GCCCP/ETH-GETH841062WESTHDF");
  });

  it("failed data retrieval sets error status and message", async() => {
    component.exchange = new ExchangePair("error97451",
      new Asset("ERROR", "Error flag", null, new Account("GERRDA", null)),
      exchange.counterAsset);
    component.ngOnInit();
    component.ngOnDestroy();    //Deactivate the loop (actually code coverage)

    expect(await component.dataStatus).toBe(DataStatus.Error);
    expect(await component.userMessage).toBe("Couldn't load data for this exchange (server: Violets are blue - Roses are red [4321])");
  });
  it("empty trade history sets status and message", async() => {
    component.exchange = new ExchangePair("no-data-78787878",
      new Asset("NoData", "", null, new Account("GEEZ", null)),
      exchange.counterAsset);
    component.ngOnInit();

    expect(await component.dataStatus).toBe(DataStatus.NoData);
    expect(await component.userMessage).toBe("No trades in last 24 hours");
  });
  it("outdated trade history sets status and message", async() => {
    component.exchange = new ExchangePair("old-data-UKJYHTGF",
      new Asset("OLD", "", null, new Account("GEEZ", null)),
      exchange.counterAsset);
    component.ngOnInit();

    expect(await component.dataStatus).toBe(DataStatus.NoData);
    expect(await component.userMessage).toBe("No trades in last 24 hours");
  });
  it("full trade history creates a chart", async() => {
    component.ngOnInit();

    expect(await component.dataStatus).toBe(DataStatus.OK);
    expect(await component.lastPrice).toBe("0.08396");
    expect(await component.dailyChangeDesc).toBe("+0.76%");
  });
  it("single OHLC candle still constructs the chart (code coverage :-| )", async() => {
    component.dataStatus = DataStatus.OK;   //To avoid false positive
    component.exchange = new ExchangePair("sparse-data",
      new Asset("OneCandle", "", null, new Account("GASPHIODJSFZKSOI", null)),
      exchange.counterAsset);
    component.ngOnInit();

    expect(await component.dataStatus).toBe(DataStatus.OK);
    expect(await component.lastPrice).toBe("1.123");
    expect(await component.dailyChangeDesc).toBe("0.00%");
  });
});

class RouterStub {
  navigateByUrl(url: string) { return; }
}

class HorizonRestServiceStub {
  getTradeAggregations(exchange: ExchangePair, interval: number) : Observable<unknown> {
    if (exchange.baseAsset.code === "ERROR") {
      return throwError(new HttpErrorResponse({
        error: { detail: "Violets are blue" },
        statusText: "Roses are red",
        status: 4321
      }));
    }
    if (exchange.baseAsset.code === "NoData") {
      return of({
        _embedded: {
          records: []
        }
      });
    }
    if (exchange.baseAsset.code === "OLD") {
      return of({
        _embedded: {
          records: [
            { timestamp: 1320966000000/*2011-11-11*/ }
          ]
        }
      });
    }
    if (exchange.baseAsset.code === "ABC" && exchange.counterAsset.issuer?.address === "GETH841062WESTHDF") {
      const now: number = new Date().valueOf();
      const MS_PER_MINUTE = 60000;
      const minuteAgo = new Date(now - 1 * MS_PER_MINUTE).valueOf();
      const min15Ago = new Date(now - 15 * MS_PER_MINUTE).valueOf();
      const min30Ago = new Date(now - 30 * MS_PER_MINUTE).valueOf();
      const hourAgo = new Date(now - 60 * MS_PER_MINUTE).valueOf();
      const min75Ago = new Date(now - 75 * MS_PER_MINUTE).valueOf();
      const twoDaysAgo = new Date(now - 2 * 24 * 60 * MS_PER_MINUTE).valueOf();

      const data = [
        { "timestamp": minuteAgo, "avg": "0.0839606" },
        { "timestamp": min15Ago, "avg": "0.0838926" },
        { "timestamp": min30Ago, "avg": "0.0838926" },
        { "timestamp": hourAgo, "avg": "0.0835518" },
        { "timestamp": min75Ago, "avg": "0.0833263" },
        { "timestamp": twoDaysAgo, "avg": "0.0801" }
      ];

      return of({
        _embedded: {
          records: data
        }
      });
    }
    if (exchange.baseAsset.code === "OneCandle") {
      const now: number = new Date().valueOf();
      return of({
        _embedded: {
          records: [
            { "timestamp": now, "avg": "1.123456" }
          ]
        }
      })
    }
    else {
      throw Error(`No test data ready for exchange ${exchange.baseAsset.code}/${exchange.counterAsset.code}`);
    }
  }
}
