import { TestBed, inject } from '@angular/core/testing';
import { Title} from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AssetService } from '../services/asset.service';
import { Asset, KnownAssets } from '../model/asset.model';
import { ExchangePair } from '../model/exchange-pair.model';
import { MyExchangesComponent } from './my-exchanges.component';
import { NebularService } from '../services/nebular.service';
import { UiActionsService } from '../services/ui-actions.service';


describe('MyExchangesComponent', () => {
    let component: MyExchangesComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Title, useClass: Title },
                {
                    provide: NebularService,
                    useValue: {
                        CookieAgreement: true
                    }
                },
                { provide: AssetService, useClass: AssetServiceStub },
                { provide: Router, useValue: {} }
            ]
        })
        .compileComponents();
    });

    beforeEach(inject([UiActionsService, NebularService, Title, AssetService], (uiService, nebularService, titleService, assetService) => {
        component = new MyExchangesComponent(uiService, nebularService, titleService, assetService);
    }));

    it('should create instance and load custom exchanges', () => {
        expect(component).toBeTruthy();
        expect(component.exchanges.length).toBe(1);
        expect(component.exchanges[0].id).toBe("blahBlahOOO000");
        expect(component.exchanges[0].counterAsset.issuer.domain).toBe("mobius.network");
    });
    
    it('Page title Should be "My Exchanges"', () => {
        const userService = TestBed.get(Title);
        expect(userService.getTitle()).toBe("My Exchanges");
    });

    it("should create new exchange", () => {
        component.addCustomExchange();
        expect(component.exchanges.length).toBe(2);
        expect(component.exchanges[1].baseAsset.code).toBe("XLM");
    });
});

class AssetServiceStub {
    public readonly customExchanges = [ new ExchangePair("blahBlahOOO000", new Asset("ABCDEF", null, null, null), KnownAssets.MOBI) ];

    CreateCustomExchange(): ExchangePair {
        const newExch = new ExchangePair("xlm--xlm", KnownAssets.XLM, KnownAssets.XLM);
        this.customExchanges.push(newExch);
        return newExch;
    }
}