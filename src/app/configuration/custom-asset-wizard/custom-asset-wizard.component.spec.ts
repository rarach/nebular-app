import { ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';

import { ActivatedRouteStub } from 'src/app/testing/activated-route-stub';
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
  let fixture: ComponentFixture<CustomAssetWizardComponent>;

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


class HorizonRestServiceStub {
    //todo
}

class AssetServiceStub {
    //todo
}