import { async, TestBed, inject } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';

import { Account } from '../model/account.model';
import { Asset } from '../model/asset.model';
import { NebularService, ILightExchangePair } from '../services/nebular.service';
import { OverviewComponent } from './overview.component';


describe('OverviewComponent', () => {
    let component: OverviewComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Title, useClass: Title },
                { provide: NebularService, useClass: NebularServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([NebularService, Title], (nebularService, titleService) => {
        component = new OverviewComponent(nebularService, titleService);
    }));

    it("should have the title 'Nebular'", () => {
        expect(component).toBeTruthy();
        const titleService = TestBed.get(Title);
        expect(titleService.getTitle()).toBe("Nebular");
    });

    it("should display top volume exchanges after #ngOnInit()", () => {
        component.ngOnInit();

        expect(component.exchangeList.length).toBe(3);
        expect(component.exchangeList[0].id).toBe("front_exch_0");
        expect(component.exchangeList[0].baseAsset.code).toBe("EOS");
        expect(component.exchangeList[0].baseAsset.issuer.address).toBe("GEOSSSSSS");
        expect(component.exchangeList[0].baseAsset.issuer.domain).toBe("eos.soe");
        expect(component.exchangeList[0].counterAsset.code).toBe("XLM");
        expect(component.exchangeList[0].counterAsset.issuer).toBeNull();
        expect(component.exchangeList[1].baseAsset.code).toBe("qwerty");
        expect(component.exchangeList[1].baseAsset.issuer.domain).toBe("qwerty.coin");
        expect(component.exchangeList[1].counterAsset.issuer.address).toBe("GEA6S0G46A3G6ASDA826S40FKDTY0S6T6DI5YU3");
        expect(component.exchangeList[2].id).toBe("front_exch_2");
        expect(component.exchangeList[2].baseAsset.code).toBe("Tock");
        expect(component.exchangeList[2].baseAsset.issuer.domain).toBe("tock.en");
        expect(component.exchangeList[2].counterAsset.issuer.domain).toBe("GBBBBAYSTDUDYZTS...");
    });
});

class NebularServiceStub {
    private dummyExchanges: ILightExchangePair[] = [
        {
            baseAsset: new Asset("EOS", null, null, new Account("GEOSSSSSS", "eos.soe")),
            counterAsset: new Asset("XLM", "Stellar Lumens", "native", null)
        },
        {
            baseAsset: new Asset("qwerty", null, null, new Account("GUERTY086464105453204084", "qwerty.coin")),
            counterAsset: new Asset("UIOP", "Another dumb cryptocoin", null, new Account("GEA6S0G46A3G6ASDA826S40FKDTY0S6T6DI5YU3", null))
        },
        {
            counterAsset: new Asset("bun-bo-nam", null, null, new Account("GBBBBAYSTDUDYZTS9898989898989898", null)),
            baseAsset: new Asset("Tock", "tick-tack tocken", null, new Account("GOTOTOKEN0648G5JDFGK", "tock.en"))
        }
    ];

    getTopVolumeExchanges() : Observable<ILightExchangePair[]> {
        return of(this.dummyExchanges);
    }
}
