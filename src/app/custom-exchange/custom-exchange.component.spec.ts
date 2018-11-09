import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Account } from '../model/account.model';
import { Asset } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { CustomExchangeComponent } from './custom-exchange.component';
import { ExchangePair } from '../model/exchange-pair.model';
import { ExchangeThumbnailComponent } from '../exchange-thumbnail/exchange-thumbnail.component';
import { HorizonRestService } from '../services/horizon-rest.service';
import { Observable } from 'rxjs';


describe('CustomExchangeComponent', () => {
    let component: CustomExchangeComponent;
    let fixture: ComponentFixture<CustomExchangeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ CustomExchangeComponent, ExchangeThumbnailComponent ],
            providers: [
                { provide: AssetService, useClass: AssetServiceStub },
                { provide: Router, useValue: {} },
                { provide: HorizonRestService, useClass: HorizonRestServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomExchangeComponent);
        component = fixture.componentInstance;
        component.exchange = new ExchangePair("cust_ex96984",
                                              new Asset("RRR", "rupee", null, new Account("GABRIELASABATINI", null, null)),
                                              new Asset("BONY", "bony", null, new Account("G014", null, null)));
        fixture.detectChanges();
    });

    it('should initialize', () => {
        expect(component).toBeTruthy();
        expect(component.exchange.id).toBe("cust_ex96984");
        expect(component.exchange.baseAsset).toEqual(new Asset("RRR", "rupee", null, new Account("GABRIELASABATINI", null, null)));
    });
    //TODO: aaaand so on. (BTW this is not really a unit test, full page is loaded. DYOR)


    it("#removeCustomExchange deletes the exchange from repository", () => {
        const assetService = TestBed.get(AssetService);
        expect(assetService.removeCalled).toBe(false);
        component.removeExchange();
        expect(assetService.removeCalled).toBe(true);
    });
});

class AssetServiceStub {
    getAssetCodesForExchange(): string[] {
        return ["MXN"];
    }

    GetIssuersByAssetCode(code: string): Account[] {
        if ("RRR" === code || "BONY" === code)
        {
            return [ new Account("GULIWER", "guli", "gu.li") ];
        }
        throw new Error("No data prepared for given input (asset code='" + code + "'");
    }

    GetIssuerByAddress(address: string): Account {
        return null;
    }

    UpdateCustomExchange(id: string, baseAssetCode: string, baseIssuerAddress: string,
                         counterAssetCode: string, counterIssuerAddress: string): ExchangePair {
        return null;
    }

    removeCalled = false;
    RemoveCustomExchange(exchId: string) {
        if ("cust_ex96984" != exchId) {
            throw "Test not ready for input exchange ID " + exchId;
        }
        this.removeCalled = true;
    }
}

class HorizonRestServiceStub {
    getTradeAggregations(exchange: ExchangePair, interval: number): Observable<Object> {
        return new Observable<Object>();
    }
}
