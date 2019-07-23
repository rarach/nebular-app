import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatRippleModule, MatSelectModule } from '@angular/material';
import { OverlayModule } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Account } from '../model/account.model';
import { Asset } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { CustomExchangeComponent } from './custom-exchange.component';
import { ExchangePair } from '../model/exchange-pair.model';
import { ExchangeThumbnailComponent } from '../exchange-thumbnail/exchange-thumbnail.component';
import { HorizonRestService } from '../services/horizon-rest.service';
import { DropdownOption } from '../model/dropdown-option';


describe('CustomExchangeComponent', () => {
    let component: CustomExchangeComponent;
    let fixture: ComponentFixture<CustomExchangeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ BrowserAnimationsModule, MatRippleModule, MatSelectModule, OverlayModule ],
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
                                              new Asset("RRR", "rupee", null, new Account("GABRIELASABATINI", null)),
                                              new Asset("BONY", "bony", null, new Account("G014", null)));
        fixture.detectChanges();
    });

    it('should initialize', () => {
        expect(component).toBeTruthy();
        expect(component.exchange.id).toBe("cust_ex96984");
        expect(component.exchange.baseAsset).toEqual(new Asset("RRR", "rupee", null, new Account("GABRIELASABATINI", null)));
    });
    it("#removeCustomExchange deletes the exchange from repository", () => {
        const assetService = TestBed.get(AssetService);
        expect(assetService.removeCalled).toBe(false);
        component.removeExchange();
        expect(assetService.removeCalled).toBe(true);
    });
    it("#baseAssetCodeChanged loads base asset issuers", () => {
        expect(component.selectedBaseIssuer.value).not.toBe("GOTO");
        component.exchange = new ExchangePair("k85u56ww56",
                                              new Asset("CKLL", null, null, new Account("GOTO", null)),
                                              new Asset("MNO", "Mona coin", null, new Account("GARIBALDI7845", "Garry.gal")));
        component.selectedBaseAssetCode = new DropdownOption("CKLL", "CKLL", null);
        component.baseAssetCodeChanged(null);
        expect(component.selectedBaseIssuer).toEqual(new DropdownOption("GOTO", "www.go.to", "www.go.to"));
    });
    it("#counterAssetCodeChanged loads counter asset issuers", () => {
        expect(component.selectedCounterIssuer.value).toBe("G014");
        component.exchange = new ExchangePair("k85u56ww56",
                                              new Asset("CKLL", null, null, new Account("GOTO", null)),
                                              new Asset("MNO", "Mona coin", null, new Account("GARIBALDI7845", "Garry")));
        component.selectedCounterAssetCode = new DropdownOption("MNO", "MNO", "monaco-in");
        component.counterAssetCodeChanged(null);
        expect(component.selectedCounterIssuer).toEqual(new DropdownOption("GARIBALDI7845", "Garry.gal", "Garry.gal"));
    });
    it("#issuerChanged calls service.UpdateCustomExchange with correct inputs", () => {
        expect(component.exchange.baseAsset.code).toBe("RRR");
        expect(component.exchange.counterAsset.issuer.address).toBe("G014");
        component.selectedBaseAssetCode = new DropdownOption("ABC", null, null);
        component.selectedBaseIssuer = new DropdownOption("GARGAMELLL", null, null);
        component.selectedCounterAssetCode = new DropdownOption("CHF", null, null);
        component.selectedCounterIssuer = new DropdownOption("(native)", null, null);
        const assetService = TestBed.get(AssetService);
        expect(assetService.updateCalled).toBeFalsy();
        component.issuerChanged(null);
        expect(assetService.updateCalled).toBeTruthy();
    });
});

describe("CustomExchangeComponent", () => {
    let component: CustomExchangeComponent;
    let fixture: ComponentFixture<CustomExchangeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ BrowserAnimationsModule, MatRippleModule, MatSelectModule, OverlayModule ],
            declarations: [ CustomExchangeComponent, ExchangeThumbnailComponent ],
            providers: [
                { provide: AssetService, useClass: AssetServiceStub },
                { provide: Router, useValue: {} },
                { provide: HorizonRestService, useClass: HorizonRestServiceStub }
            ]
        })
        .compileComponents();
    }));

    it("loads available assets codes - unknown (custom) codes", () => {
        fixture = TestBed.createComponent(CustomExchangeComponent);
        component = fixture.componentInstance;
        component.exchange = new ExchangePair("768y4-sdf1",
                                              new Asset("altte", "alternative", null, new Account("GCD5DG453SER745C415CG", "china-coin.cn")),
                                              new Asset("UNITA", "Unity coin", null, new Account("GORE", "gore.xyz")));
        fixture.detectChanges();

        expect(component.selectedBaseAssetCode).toEqual(new DropdownOption("altte", "altte", "altte (custom)"));
        expect(component.selectedCounterAssetCode).toEqual(new DropdownOption("UNITA", "UNITA", "UNITA (custom)"));
    });
});


class AssetServiceStub {
    getAssetCodesForExchange(): string[] {
        return [ "XLM", "BONY", "MXN", "RRR" ];
    }

    GetIssuersByAssetCode(code: string): Account[] {
        if ("RRR" === code || "BONY" === code)
        {
            return [ new Account("GULIWER", "gu.li") ];
        }
        if ("CKLL" ===  code) {
            return [ new Account("GOTO", "www.go.to"), new Account("GBBshouldntBeUsed", null) ];
        }
        if ("MNO" === code) {
            return [ new Account("GARIBALDI7845", "Garry.gal"), new Account("GAuseless", null) ];
        }
        if ("altte" === code || "UNITA" === code) {
            return [ ];
        }
        throw new Error("No data prepared for given input (asset code='" + code + "')");
    }

    GetIssuerByAddress(address: string): Account {
        if ("GABRIELASABATINI" === address || "G014" === address || "GCD5DG453SER745C415CG" === address || "GORE" === address) {
            return null;
        }
        if ("GOTO" === address) {
            return new Account("GOTO", "www.go.to" );
        }
        if ("GARIBALDI7845" === address) {
            return new Account("GARIBALDI7845", "GariBal.dii");
        }
        throw new Error("No data prepared for given input (address=" + address + ")");
    }

    updateCalled = false;
    UpdateCustomExchange(id: string, baseAssetCode: string, baseIssuerAddress: string,
                         counterAssetCode: string, counterIssuerAddress: string): ExchangePair {
        if ("cust_ex96984" === id && "ABC" === baseAssetCode && "GARGAMELLL" === baseIssuerAddress &&
            "CHF" === counterAssetCode && "(native)" === counterIssuerAddress)
        {
            this.updateCalled = true;
            return null;
        }
        if ("k85u56ww56" === id) {
            return null;
        }
        throw new Error("No data prepared for given inputs (exchange id=" + id + ")");
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
