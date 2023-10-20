import { ActivatedRoute } from '@angular/router';
import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { Asset } from '../../model/asset.model';
import { AssetData } from '../../model/asset-data.model';
import { AssetService } from '../../services/asset.service';
import { Constants } from '../../model/constants';
import { CustomAssetWizardComponent } from './custom-asset-wizard.component';
import { HorizonRestService } from '../../services/horizon-rest.service';
import { TomlConfigService } from '../../services/toml-config.service';
import { TomlConfigServiceStub } from '../../testing/stubs';

describe('CustomAssetWizardComponent', () => {
  let component: CustomAssetWizardComponent;

  beforeEach(waitForAsync(() => {
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
name = "glance token (or something)"
[[CURRENCIES]]
code = "IRESA"
desc = "Iresa token"
name = "!@#$%"
display_decimals = 50
issuer = "G00GLE"
image = "ab.cd/ef.jpg"`) },
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
  it("#searchAssetCodes()->loadAssetIcons() uses default icon if asset's config is unreachable", () => {
    const formStub: NgForm = {
      invalid: false,
      value: { newAssetCode: "TOML_ERROR" }
    } as NgForm;
    component.searchAssetCodes(formStub);
    expect(component.searchStatus).toBe("FINISHED");
    expect(component.foundAssets.length).toBe(1);
    expect(component.foundAssets[0].iconUrl).toBe(Constants.UNKNOWN_ASSET_IMAGE);
  });
  it("#searchAssetCodes() finds assets", () => {
    const formStub: NgForm = {
      invalid: false,
      value: { newAssetCode: "IRESA" }
    } as NgForm;
    component.searchAssetCodes(formStub);
    const iresaAsset = new AssetData("google.com/.well-known/stellar.toml", "IRESA", "G00GLE", 65);
    iresaAsset.iconUrl = "ab.cd/ef.jpg";
    expect(component.foundAssets).toEqual([
      new AssetData(null, "IRESA", "GAAAABBBBBCCCCCCCCCC555", 80),
      iresaAsset
    ]);
  });

  it("#addAsset() OK", () => {
    component.foundAssets = [
      new AssetData(null, "ONE", "GONE", 10),
      new AssetData(null, "TWO", "GATWO", 20),
      new AssetData(null, "THREE", "GBBB3", 7)
    ];
    spyOn(component.assetAdded, "emit");

    component.addAsset(new AssetData("some.org/.well-known/stellar.toml", "TWO", "GATWO", 12345));

    expect(component.assetAdded.emit).toHaveBeenCalledWith({newAssetCode: "TWO", newAssetIssuer: "GATWO"});
    expect(component.foundAssets).toEqual([
      new AssetData(null, "ONE", "GONE", 10),
      new AssetData(null, "THREE", "GBBB3", 7)
    ]);
  });
  it("#addAsset() fails and emits 'addAssetFailed'", () => {
    component.foundAssets = [];
    spyOn(component.addAssetFailed, "emit");

    component.addAsset(new AssetData("example.org/.well-known/stellar.toml", "FAIL", "GCCCCCCP", 8654));

    expect(component.addAssetFailed.emit).toHaveBeenCalledWith({ assetCode: "FAIL", assetIssuer: "GCCCCCCP"});
  });
});


class HorizonRestServiceStub {
  getAssetIssuers(assetCode: string) : Observable<AssetData[] | null> {
    if ("NoSuch" === assetCode) {
      return of(null);
    }
    if ("IRESA" === assetCode) {
      return of([
        new AssetData("google.com/.well-known/stellar.toml", "IRESA", "G00GLE", 65),
        new AssetData(null, "IRESA", "GAAAABBBBBCCCCCCCCCC555", 80)
      ]);
    }
    if ("TOML_ERROR" === assetCode) {
      return of([
        new AssetData("THROW_ERROR", null!, null!, -1)
      ]);
    }
    throw new Error("No test data ready for the input asset code " + assetCode);
  }
}

class AssetServiceStub {
  AddCustomAsset(assetCode: string, issuerAddress: string, issuerDomain: string, imageUrl: string): Asset | null {
    if ("TWO" === assetCode && "GATWO" === issuerAddress) {
      return {} as Asset;
    }
    return null;
  }
}
