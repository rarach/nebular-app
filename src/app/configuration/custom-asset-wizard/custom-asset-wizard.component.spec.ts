import { ActivatedRoute } from '@angular/router';
import { async, TestBed, inject } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { ActivatedRouteStub } from 'src/app/testing/activated-route-stub';
import { Asset } from 'src/app/model/asset.model';
import { AssetData } from 'src/app/model/asset-data.model';
import { AssetService } from 'src/app/services/asset.service';
import { CustomAssetWizardComponent } from './custom-asset-wizard.component';
import { HorizonRestService } from 'src/app/services/horizon-rest.service';
import { TomlConfigService } from 'src/app/services/toml-config.service';
import { TomlConfigServiceStub } from 'src/app/testing/stubs';


describe("CustomAssetWizardComponent", () => {
    it("#ngOnInit sets 'inputAssetCode' when it's given in URL", () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ActivatedRoute, useValue: new ActivatedRouteStub() }
            ]
        }).compileComponents();
        const route = TestBed.get(ActivatedRoute);
        route.setParamMap({assetType: "G0G0"});
        const instance = new CustomAssetWizardComponent(route, null, null, null);

        instance.ngOnInit();
        expect(instance.inputAssetCode).toBe("G0G0");

        //Teardown (and code coverage)
        instance.ngOnDestroy();
    });
});


describe('CustomAssetWizardComponent', () => {
  let component: CustomAssetWizardComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
        declarations: [ CustomAssetWizardComponent ],
        imports: [ FormsModule ],
        providers: [
            { provide: ActivatedRoute, useValue: {} },
            { provide: HorizonRestService, useClass: HorizonRestServiceStub },
            { provide: TomlConfigService, useValue: new TomlConfigServiceStub(`[[CURRENCIES]]
code = "zero-coin"
desc = "a test token"
display_decimals = 2
issuer = "GAZERO"
name = "O test token"
[[CURRENCIES]]
code = "ASDF"
desc = "another test token"
display_decimals = 2
issuer = "GASDF"
name = "asdf cash"
[[CURRENCIES]]
code = "GTN"
desc = "glitz koin"
display_decimals = 4
issuer = "GBETLEHEM"
name = "glance token (or something)"`) },
            { provide: AssetService, useClass: AssetServiceStub }
        ]
        })
        .compileComponents();
    }));

    beforeEach(inject([ActivatedRoute, HorizonRestService, TomlConfigService, AssetService], (route, horizonSevice, configService, assetService) => {
        component = new CustomAssetWizardComponent(route, horizonSevice, configService, assetService);
    }));

    it("#searchAssetCodes() exits immediately if the input form is invalid", () => {
        const horizonSpy = spyOn(TestBed.get(HorizonRestService), "getAssetIssuers");
        const formStub: NgForm = {
            invalid: true,
            value: { newAssetCode: "QWERT" }
        } as NgForm;
        component.searchAssetCodes(formStub);
        expect(horizonSpy).not.toHaveBeenCalled();
    });
    it("#searchAssetCodes() exits immediately if the input asset code is empty", () => {
        const horizonSpy = spyOn(TestBed.get(HorizonRestService), "getAssetIssuers");
        const formStub: NgForm = {
            invalid: false,
            value: { newAssetCode: "" }
        } as NgForm;
        component.searchAssetCodes(formStub);
        expect(horizonSpy).not.toHaveBeenCalled();
    });
    it("#searchAssetCodes() found no assets", () => {
        const formStub: NgForm = {
            invalid: false,
            value: { newAssetCode: "NoSuch" }
        } as NgForm;
        component.searchAssetCodes(formStub);
        expect(component.foundAssets).toBeNull();
        expect(component.searchStatus).toBe("FINISHED");
    });
    it("#searchAssetCodes() finds assets", () => {
        const formStub: NgForm = {
            invalid: false,
            value: { newAssetCode: "IRESA" }
        } as NgForm;
        component.searchAssetCodes(formStub);
        expect(component.foundAssets).toEqual([
            new AssetData(null, "alphanum4", "IRESA", "GAAAABBBBBCCCCCCCCCC555", 80),
            new AssetData("google.com/.well-known/stellar.toml", null, "IRESA", "G00GLE", 65)
        ])
    });

    it("#addAsset() OK", () => {
        component.foundAssets = [
            new AssetData(null, null, "ONE", "GONE", 10),
            new AssetData(null, null, "TWO", "GATWO", 20),
            new AssetData(null, null, "THREE", "GBBB3", 7)
        ];
        spyOn(component.assetAdded, "emit");

        component.addAsset(new AssetData("some.org/.well-known/stellar.toml", "alphanum4", "TWO", "GATWO", 12345));

        expect(component.assetAdded.emit).toHaveBeenCalledWith({newAssetCode: "TWO", newAssetIssuer: "GATWO"});
        expect(component.foundAssets).toEqual([
            new AssetData(null, null, "ONE", "GONE", 10),
            new AssetData(null, null, "THREE", "GBBB3", 7)
        ]);
    });
    it("#addAsset() fails and emits 'addAssetFailed'", () => {
        component.foundAssets = [];
        spyOn(component.addAssetFailed, "emit");

        component.addAsset(new AssetData("example.org/.well-known/stellar.toml", null, "FAIL", "GCCCCCCP", 8654));

        expect(component.addAssetFailed.emit).toHaveBeenCalledWith({ assetCode: "FAIL", assetIssuer: "GCCCCCCP"});
    });
});


class HorizonRestServiceStub {
    getAssetIssuers(assetCode: string) : Observable<AssetData[]> {
        if ("NoSuch" === assetCode) {
            return of(null);
        }
        if ("IRESA" === assetCode) {
            return of([
                new AssetData("google.com/.well-known/stellar.toml", null, "IRESA", "G00GLE", 65),
                new AssetData(null, "alphanum4", "IRESA", "GAAAABBBBBCCCCCCCCCC555", 80)
            ]);
        }
        throw new Error("No test data ready for the input asset code " + assetCode);
    }
}

class AssetServiceStub {
    AddCustomAsset(assetCode: string, issuerAddress: string, issuerDomain: string = null, imageUrl: string = null): Asset {
        if ("TWO" === assetCode && "GATWO" === issuerAddress) {
            return {} as Asset;
        }
        return null;
    }
}
