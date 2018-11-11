import { ActivatedRoute } from '@angular/router';
import { async, inject, TestBed } from '@angular/core/testing';

import { Account } from 'src/app/model/account.model';
import { Asset } from 'src/app/model/asset.model';
import { AssetService } from 'src/app/services/asset.service';
import { CustomAssetsComponent } from './custom-assets.component';


describe('CustomAssetsComponent', () => {
    let component: CustomAssetsComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ActivatedRoute, useValue: {}},
                { provide: AssetService, useClass: AssetServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([ActivatedRoute, AssetService], (route, assetService) => {
        component = new CustomAssetsComponent(route, assetService);
    }));

    it('should have custom assets loaded after instantiation', () => {
        expect(component).toBeTruthy();
        expect(component.customAssets.length).toBe(2);
        expect(component.customAssets[1].code).toBe("ETC");
    });

    it("#addAsset returns immediately if inputs are empty", () => {
        component.lastAddedAsset = new Asset("XYYYYZ", "XYZ test", null, null);
        component.addAsset();
        expect(component.lastAddedAsset).toEqual(new Asset("XYYYYZ", "XYZ test", null, null));

        component.selectedAssetCode = "whatever";
        component.addAsset();
        expect(component.lastAddedAsset).toEqual(new Asset("XYYYYZ", "XYZ test", null, null));
    });
    //TODO: figure out how to test the private properties (maybe we get rid of the jQuery drop-down component?)
    it("#removeAsset", () => {
        component.removeAsset("GOE", "GEEEERDY74747474");
        const assetService = TestBed.get(AssetService);
        expect(assetService.removeCalled).toBe(true);
    });

    //TODO: somehow test the ddSlick thing
});

class AssetServiceStub {
    customAssets = [
        new Asset("GBP", "Sterling pound", null, new Account("GBPPPPPPPPPPPPPPPPP752", null, null)),
        new Asset("ETC", "Ethereum classic", null, new Account("GORRILA", null, null))
    ];

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
        return [ "ZZZz" ];
    }
}
