import { async, TestBed, inject, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute,  convertToParamMap, Router, ParamMap, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReplaySubject, Observable } from 'rxjs';

import { AssetService } from '../services/asset.service';
import { DataStatus } from '../model/data-status.enum';
import { ExchangeComponent } from './exchange.component';
import { HorizonRestService } from '../services/horizon-rest.service';
import { ExchangePair } from '../model/exchange-pair.model';
import { KnownAssets } from '../model/asset.model';



describe('ExchangeComponent', () => {
    let exchComponent: ExchangeComponent;
    let activRoute: ActivatedRouteStub;

    beforeEach(async(() => {
        activRoute = new ActivatedRouteStub();
        TestBed.configureTestingModule({
            providers: [
                { provide: ActivatedRoute, /* useClass: ActivatedRouteStub */ useValue: activRoute },
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
        exchComponent.exchange = new ExchangePair("test01", KnownAssets.XLM, KnownAssets.TELLUS);
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
/*TODO (WATCH OUT! This one throws silent error. In Karma page it looks like fail of some other test)
    it("should initialize exchange from URL parameters", () => {
        activRoute.setParamMap({ baseAssetId: "XLM", counterAssetId: "XYZ-GAGALADY" });
        expect(exchComponent.dataStatus).toBe(DataStatus.OK);
        exchComponent.ngOnInit();
        expect(exchComponent.exchange.baseAsset.code).toBe("XLM");
        expect(exchComponent.dataStatus).toBe(DataStatus.OK);
    }); */
});

//credit belongs to https://angular.io/guide/testing#activatedroutestub
export class ActivatedRouteStub {   //TODO: move to testing/activated-route-stub.ts
    // Use a ReplaySubject to share previous values with subscribers
    // and pump new values into the `paramMap` observable
    private subject = new ReplaySubject<ParamMap>();
  
    constructor(initialParams?: Params) {
      this.setParamMap(initialParams);
    }
  
    /** The mock paramMap observable */
    readonly paramMap = this.subject.asObservable();
  
    /** Set the paramMap observables's next value */
    setParamMap(params?: Params) {
        this.subject.next(convertToParamMap(params));
    }
}

class RouterStub {
    //todo
}

class AssetServiceStub {
    //todo
}

class TitleStub {
    title: string = null;
    setString(value: string) { this.title = value; }
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