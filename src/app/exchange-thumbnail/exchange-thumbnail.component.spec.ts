import { async, TestBed, inject } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { ExchangeThumbnailComponent } from './exchange-thumbnail.component';
import { ExchangePair } from '../model/exchange-pair.model';
import { Asset } from '../model/asset.model';
import { Account } from '../model/account.model';
import { HorizonRestService } from '../services/horizon-rest.service';


describe('ExchangeThumbnailComponent', () => {
    let component: ExchangeThumbnailComponent;
    const exchange = new ExchangePair("asdf123",
                                      new Asset("ABC", "ABC", null, new Account("GCCCP", null)),
                                      new Asset("ETH", "ETH", null, new Account("GETH841062WESTHDF", null)));

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useClass: RouterStub },
                { provide: HorizonRestService, useClass: HorizonRestServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([NgZone, Router, HorizonRestService], (zone, router, horizonService) => {
        component = new ExchangeThumbnailComponent(zone, router, horizonService);
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
    //TODO: and the rest...
});

class RouterStub {
    navigateByUrl(url: string) {
        if ("" != url) {
            throw new Error("No test data ready for given input (url: '" + url + "'");
        }
    }
}

class HorizonRestServiceStub {
    //todo
}
