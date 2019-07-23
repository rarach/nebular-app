import { async, TestBed, inject } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';

import { Account } from '../model/account.model';
import { ActivatedRouteStub } from '../testing/activated-route-stub';
import { AssetService } from '../services/asset.service';
import { DataStatus } from '../model/data-status.enum';
import { ExchangeComponent } from './exchange.component';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { KnownAssets } from '../model/asset.model';
import { TitleStub } from '../testing/stubs';


describe('ExchangeComponent', () => {
    let exchComponent: ExchangeComponent;
    let activRoute: ActivatedRouteStub;

    beforeEach(async(() => {
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
    }));
    beforeEach(inject([ActivatedRoute, Router, Title, AssetService, HorizonRestService],
                      (route, router, titleService, assetService, horizonRestService) => {
        exchComponent = new ExchangeComponent(route, router, titleService, assetService, horizonRestService);
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
    it("should initialize exchange from URL parameters", () => {
        activRoute.setParamMap({ baseAssetId: "XLM", counterAssetId: "XYZ-GAGALADY", interval: "1hour" });
        expect(exchComponent.dataStatus).toBe(DataStatus.OK);
        exchComponent.ngOnInit();
        expect(exchComponent.exchange.baseAsset.code).toBe("XLM");
        expect(exchComponent.chartInterval).toBe(3600000);
        //Code coverage...
        exchComponent.ngOnDestroy();
    }); 
});

class RouterStub {
    //todo
}

class AssetServiceStub {
    getAssetCodesForExchange(): string[] {
        return [ "Xyz" ];
    }

    GetIssuersByAssetCode(assetCode: string): Account[] {
        return [];
    }

    GetIssuerByAddress(address: string): Account {
        return null;
    }
}

class HorizonRestServiceStub {
    getTradeHistory(): Observable<Object> {
        return new Observable<Object>();
    }

    getTradeAggregations(): Observable<Object> {
        return new Observable<Object>();
    }

    getOrderbook(): Observable<Object> {
        return new Observable<Object>();
    }
}