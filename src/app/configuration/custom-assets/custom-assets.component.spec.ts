import { ActivatedRoute } from '@angular/router';
import { async, inject, TestBed } from '@angular/core/testing';

import { Account, KnownAccounts } from 'src/app/model/account.model';
import { Asset } from 'src/app/model/asset.model';
import { AssetService } from 'src/app/services/asset.service';
import { CustomAssetsComponent } from './custom-assets.component';
import { ActivatedRouteStub } from 'src/app/testing/activated-route-stub';
import { DropdownOption } from 'src/app/model/dropdown-option';



describe('CustomAssetsComponent', () => {
    it('should have custom assets loaded after instantiation', () => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: AssetService, useValue: {
                    customAssets: [
                        new Asset("GBP", "Sterling pound", null, new Account("GBPPPPPPPPPPPPPPPPP752", null, null)),
                        new Asset("ETC", "Ethereum classic", null, new Account("GORRILA", null, null))
                    ]}
                }
            ]
        }).compileComponents();
        
        const assetService = TestBed.get(AssetService);
        const component = new CustomAssetsComponent(null, assetService);

        expect(component.customAssets.length).toBe(2);
        expect(component.customAssets[1].code).toBe("ETC");
    });
});


describe('CustomAssetsComponent', () => {
    let component: CustomAssetsComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ActivatedRoute, useValue: {} },
                { provide: AssetService, useClass: AssetServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([ActivatedRoute, AssetService], (route, assetService) => {
        component = new CustomAssetsComponent(route, assetService);
    }));

    it("#addAsset returns immediately if inputs are empty", () => {
        component.lastAddedAsset = new Asset("XYYYYZ", "XYZ test", null, null);
        component.addAsset();
        expect(component.lastAddedAsset).toEqual(new Asset("XYYYYZ", "XYZ test", null, null));

        component.selectedAssetCode = "whatever";
        component.addAsset();
        expect(component.lastAddedAsset).toEqual(new Asset("XYYYYZ", "XYZ test", null, null));
    });
    it("#addAsset adds new asset; assigns lastAddedAsset", () => {
        component.selectedAssetCode = "RRR";
        component.selectedIssuerAddress = "GORGONDOLA40651277187";
        component.addAsset();
        expect(component.lastAddedAsset.code).toBe("RRR");
    });
    it("#removeAsset", () => {
        component.removeAsset("GOE", "GEEEERDY74747474");
        const assetService = TestBed.get(AssetService);
        expect(assetService.removeCalled).toBe(true);
    });

    it("#loadAssetCodes loads available asset types", () => {
        component.updateAssetCodes();
        expect(component.assetCodes).toEqual([
            new DropdownOption("ZZZz", "ZZZz", "ZZZz (custom)"),
            new DropdownOption("GOAL", "GOAL", "GOAL (custom)"),
            new DropdownOption("dry", "dry", "dry (custom)"),
            new DropdownOption("EURT", "EURT", "Euro")
        ]);
    });

    it("#loadIssuer() loads anchors", () => {
        component.updateIssuers();

        expect(component.assetIssuers).toEqual([
            new DropdownOption("GALAPAGESSS", "gala.pages (GALAPAGE...)", "GALAPAGESSS"),
            new DropdownOption("GDEGOXPCHXWFYY234D2YZSPEJ24BX42ESJNVHY5H7TWWQSYRN5ZKZE3N",
                               "sureremit.co (GDEGOXPC...N5ZKZE3N)",
                               "GDEGOXPCHXWFYY234D2YZSPEJ24BX42ESJNVHY5H7TWWQSYRN5ZKZE3N")
        ]);
    });
});


describe("CustomAssetsComponent", () => {
    it("#ngOnInit sets 'selectedAssetType' when it's given in URL", () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ActivatedRoute, useValue: new ActivatedRouteStub() },
                { provide: AssetService, useValue: { getAllAssetCodes: () => [], getAllAnchors: () => [] } }
            ]
        }).compileComponents();
        const route = TestBed.get(ActivatedRoute);
        route.setParamMap({assetType: "G0G0"});
        const assetService = TestBed.get(AssetService);
        const instance = new CustomAssetsComponent(route, assetService);

        instance.ngOnInit();
        expect(instance.selectedAssetCode).toBe("G0G0");

        //Teardown (and code coverage)
        instance.ngOnDestroy();
    });
});


class AssetServiceStub {

    AddCustomAsset(assetCode: string, issuerAddress: string): Asset {
        if (null === assetCode || null == issuerAddress) {
            throw Error("Both input parameters for asset are NULL!");
        }
        return new Asset(assetCode, "this is test", null, null);
    }

    removeCalled = false;
    RemoveCustomAsset(assetCode: string, anchorAddress: string) {
        if ("GOE" === assetCode && "GEEEERDY74747474" === anchorAddress) {
            this.removeCalled = true;
        }
        else {
            throw new Error(`No test data prepared for inputs '${assetCode}', '${anchorAddress}'`);
        }
    }

    getAllAssetCodes(): string[] {
        return [ "ZZZz", "GOAL", "dry", "EURT" ];
    }

    getAllAnchors(): Account[] {
        return [
            new Account(null, null, "stellar.org"),
            new Account("GALAPAGESSS", "Test issuer Galapag", "gala.pages"),
            KnownAccounts.SureRemit
        ]
    }
}
