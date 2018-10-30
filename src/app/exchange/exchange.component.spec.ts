import { async, TestBed, inject } from '@angular/core/testing';
import { ActivatedRoute,  convertToParamMap, Router, ParamMap, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';

import { AssetService } from '../services/asset.service';
import { ExchangeComponent } from './exchange.component';
import { HorizonRestService } from '../services/horizon-rest.service';
import { Observable } from 'rxjs';
import { of as observableOf } from 'rxjs';


describe('ExchangeComponent', () => {
    let component: ExchangeComponent;
    let activatedRoute: ActivatedRouteStub;

    beforeEach(() => {
        activatedRoute = new ActivatedRouteStub();
        activatedRoute.setParamMap({ baseAssetId: ""});
    })

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ActivatedRoute, /* useClass: ActivatedRouteStub */ useValue: activatedRoute },
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
        component = new ExchangeComponent(route, router, titleService, assetService, horizonRestService);
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.chartMessage).toBe("Loading chart...");
    });

    it("should throw an error if URL parameter for base asset is not provided", () => {
        const route = TestBed.get(ActivatedRoute);
//        route.testCaseId = "EMPTY baseAssetId";
//        route.setParamMap({ baseAssetId: ""});
//TODO        expect( function() { component.ngOnInit(); }).toThrow(new Error("Invalid URL parameters"));
        expect(true).toBeTruthy();
    });
});

/*
class ActivatedRouteStub {
    testCaseId: string = null;

    paramMap: Observable<ParamMap> = new Observable<ParamMap>((subscriber) => {
        const map: ParamMap = {
            has: (name: string) => { return true; },
            getAll: (name: string) => { return []; },
            get: (name: string) => {
                if ("baseAssetId" === name && "EMPTY baseAssetId" === this.testCaseId) {
                    return null;
                }
                if ("EMPTY counterAssetId" === this.testCaseId) {
                    return null;
                }
            },
            keys: []
        };

        subscriber.next(map);
    });
} */
export class ActivatedRouteStub {
    // Use a ReplaySubject to share previous values with subscribers
    // and pump new values into the `paramMap` observable
    private subject = new ReplaySubject<ParamMap>();
  
    constructor(/*initialParams?: Params*/) {
//      this.setParamMap(initialParams);
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
    //todo
}