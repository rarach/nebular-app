import { async, TestBed, inject } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { AssetService } from '../services/asset.service';
import { ExchangeComponent } from './exchange.component';
import { HorizonRestService } from '../services/horizon-rest.service';


describe('ExchangeComponent', () => {
    let component: ExchangeComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
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
        component = new ExchangeComponent(route, router, titleService, assetService, horizonRestService)
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

class ActivatedRouteStub {
    //todo
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