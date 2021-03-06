import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OverlayModule } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Account } from '../model/account.model';
import { Asset, KnownAssets } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { CustomExchangeComponent } from './custom-exchange.component';
import { DropdownOption } from '../model/dropdown-option';
import { ExchangePair } from '../model/exchange-pair.model';
import { ExchangeThumbnailComponent } from '../exchange-thumbnail/exchange-thumbnail.component';
import { HorizonRestService } from '../services/horizon-rest.service';
import { UiActionsService } from '../services/ui-actions.service';


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

    it("#removeExchange() deletes the exchange from repository", () => {
        const assetService = TestBed.get(AssetService);
        expect(assetService.removeCalled).toBe(false);
        component.removeExchange();
        expect(assetService.removeCalled).toBe(true);
    });

    it("#updateExchange() calls service.UpdateCustomExchange with correct inputs", () => {
        expect(component.exchange.baseAsset.code).toBe("RRR");
        expect(component.exchange.counterAsset.issuer.address).toBe("G014");

        component.selectedBaseAsset = new DropdownOption(new Asset("ABC", null, null, new Account("GARGAMELLL", "rag.gar")),
                                                         "ABC-GARGame.l", null);
        component.selectedCounterAsset = new DropdownOption(new Asset("CHF", null, null, new Account("GANything", null)),
                                                            "CHF-GANything (swiss franck)", null);
        const assetService = TestBed.get(AssetService);
        expect(assetService.updateCalled).toBeFalsy();
        component.updateExchange(null);
        expect(assetService.updateCalled).toBeTruthy();
    });

    it("#onMouseOver() should highlight border if another exchange pair is being dragged", () => {
        const uiService : UiActionsService = TestBed.get(UiActionsService);
        const dummyExch = new ExchangePair("test-exch",
                                           new Asset("TEST", null, null, new Account("GABRIELSSSSSS096", "test.org")),
                                           new Asset("NopE", null, null, new Account("GDDD", "whet.ever")));
        spyOnProperty(uiService, "DraggingExchange", "get").and.returnValue(dummyExch);

        expect(component.highlightDropTarget).toBe(false);

        component.onMouseOver();

        expect(component.highlightDropTarget).toBe(true);
    });

    it("#onClick() should swap exchanges with right IDs if another exchange is being dragged", () => {
        const uiService : UiActionsService = TestBed.get(UiActionsService);
        const dummyExch = new ExchangePair("ex_to_swap",
                                           new Asset("TEST", null, null, new Account("GABRIELSSSSSS096", "test.org")),
                                           new Asset("NopE", null, null, new Account("GDDD", "whet.ever")));
        spyOnProperty(uiService, "DraggingExchange", "get").and.returnValue(dummyExch);

        let stopPropagationCalled = false;
        const eventSpy = { stopPropagation: () => stopPropagationCalled = true };

        component.onClick(eventSpy);

        expect(stopPropagationCalled).toBe(true);
        const assetService = TestBed.get(AssetService);
        expect(assetService.swapCalled).toBe(true);
    });

    it("#startDrag() calls UiActions.draggingStarted with current exchange", () => {
        const uiService : UiActionsService = TestBed.get(UiActionsService);
        const dummyExch = new ExchangePair("test-exch",
                                           new Asset("TEST", null, null, new Account("GABRIELSSSSSS096", "test.org")),
                                           new Asset("NopE", null, null, new Account("GDDD", "whet.ever")));
        spyOnProperty(uiService, "DraggingExchange", "get").and.returnValue(dummyExch);
        spyOn(uiService, "draggingStarted").and.callFake(() => {});

        let stopPropagationCalled = false;
        const eventSpy = { stopPropagation: () => stopPropagationCalled = true };

        component.startDrag(eventSpy);

        expect(stopPropagationCalled).toBe(true);
        expect(uiService.draggingStarted).toHaveBeenCalledWith(component.exchange);
    });

    it("#isDragged() should return true if current exchange pair is being dragged", () => {
        const uiService : UiActionsService = TestBed.get(UiActionsService);
        const dummyExch = new ExchangePair("cust_ex96984",
                                           new Asset("DOESN'T", null, null, null),
                                           new Asset("MATTER", null, null, new Account("GAAASGHASFGGDH4561", "HERE")));
        spyOnProperty(uiService, "DraggingExchange", "get").and.returnValue(dummyExch);

        let value = component.isDragged;

        expect(value).toBe(true);
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

    it("loads available assets - unknown (custom) assets", () => {
        fixture = TestBed.createComponent(CustomExchangeComponent);
        component = fixture.componentInstance;
        component.exchange = new ExchangePair("768y4-sdf1",
                                              new Asset("altte", "alternative", null, new Account("GCD5DG453SER745C415CG", "china-coin.cn")),
                                              new Asset("UNITA", "Unity coin", null, new Account("GORE", "gore.xyz")));
        fixture.detectChanges();

        expect(component.selectedBaseAsset).toEqual(new DropdownOption(new Asset("altte", "altte", null, new Account("GCD5DG453SER745C415CG", "GCD5DG453SER745C...")),
                                                                       "altte-GCD5DG453SER745C415CG",
                                                                       "altte-GCD5DG453SER745C415CG", "./assets/images/asset_icons/unknown.png"));
        expect(component.selectedCounterAsset).toEqual(new DropdownOption(new Asset("UNITA", "UNITA", null, new Account("GORE", "GORE...")),
                                                                          "UNITA-GORE",
                                                                          "UNITA-GORE", "./assets/images/asset_icons/unknown.png"));
    });

    it("loads available assets - known assets", () => {
        fixture = TestBed.createComponent(CustomExchangeComponent);
        component = fixture.componentInstance;
        component.exchange = new ExchangePair("xlm_usd-anchorUsd", KnownAssets.XLM, KnownAssets["USD-AnchorUsd"]);
        fixture.detectChanges();

        expect(component.selectedBaseAsset).toEqual(new DropdownOption(KnownAssets.XLM,
                                                                       "XLM",
                                                                       "Lumen", "./assets/images/asset_icons/unknown.png"/*Doesn't matter here*/));
        expect(component.selectedCounterAsset).toEqual(new DropdownOption(KnownAssets["USD-AnchorUsd"],
                                                                          "USD-anchorusd.com",
                                                                          "US dollar", "./assets/images/asset_icons/unknown.png"/*Doesn't matter here*/));
    });
});


class AssetServiceStub {
    getAvailableAssets(): Asset[] {
        return [
            KnownAssets.XLM,
            KnownAssets["USD-AnchorUsd"]
        ];
    }

    GetIssuersByAssetCode(code: string): Account[] {
        if ("RRR" === code || "BONY" === code)
        {
            return [ new Account("GULIWER", "gu.li") ];
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
        throw new Error("No data prepared for given input (address=" + address + ")");
    }

    updateCalled = false;
    UpdateCustomExchange(exchangeId: string, baseAsset: Asset, counterAsset: Asset) {
        if ("cust_ex96984" === exchangeId && "ABC" === baseAsset.code && "GARGAMELLL" === baseAsset.issuer.address &&
            "CHF" === counterAsset.code && "GANything" === counterAsset.issuer.address)
        {
            this.updateCalled = true;
            return null;
        }
        if ("k85u56ww56" === exchangeId) {
            return null;
        }

        throw new Error(`No data ready for given inputs (exch id=${exchangeId}; base code=${baseAsset.code}; base issuer=${baseAsset.issuer.address} ...)`);
    }

    removeCalled = false;
    RemoveCustomExchange(exchId: string) {
        if ("cust_ex96984" != exchId) {
            throw "Test not ready for input exchange ID " + exchId;
        }
        this.removeCalled = true;
    }

    swapCalled = false;
    SwapCustomExchanges(exch1: ExchangePair, exch2: ExchangePair) {
        if ("cust_ex96984" === exch1.id && "ex_to_swap" === exch2.id) {
            this.swapCalled = true;
        }
        else {
            throw new Error(`No data ready for given inputs (exch1.id=${exch1.id}; exch2.id=${exch2.id};)`);
        }
    }
}

class HorizonRestServiceStub {
    getTradeAggregations(exchange: ExchangePair, interval: number): Observable<Object> {
        return new Observable<Object>();
    }
}
