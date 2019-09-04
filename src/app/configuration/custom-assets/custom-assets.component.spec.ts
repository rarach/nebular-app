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
                { provide: ActivatedRoute, useValue: {} },
                { provide: AssetService, useClass: AssetServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([ActivatedRoute, AssetService], (route, assetService) => {
        component = new CustomAssetsComponent(route, assetService);
    }));

    it('should have custom assets loaded after instantiation', () => {
        expect(component.customAssets.length).toBe(2);
        expect(component.customAssets[1].code).toBe("ETC");
    });

    it("#removeAsset", () => {
        component.removeAsset("GOE", "GEEEERDY74747474");
        const assetService = TestBed.get(AssetService);
        expect(assetService.removeCalled).toBe(true);
    });

    it("#highlightLastAddedAsset() assigns lastAddedAsset", () => {
        component.lastAddedAsset = null;
        component.highlightLastAddedAsset({newAssetCode: "ETC", newAssetIssuer: "GORRILA"});

        expect(component.lastAddedAsset).toEqual(new Asset("ETC", "Ethereum classic", null, new Account("GORRILA", null)));
        expect(component.duplicateAsset).toBeNull();
    });

    it("#highlightDuplicateAsset() assigns duplicateAsset", () => {
        component.duplicateAsset = null;
        component.highlightDuplicateAsset({assetCode: "RiTTal", assetIssuer: "GORGONDOLA"});

        expect(component.duplicateAsset).toBe("RiTTal-GORGONDOLA")
        expect(component.lastAddedAsset).toBeNull();
    });
});


class AssetServiceStub {
    readonly customAssets: Asset[] = [
        new Asset("GBP", "Sterling pound", null, new Account("GBPPPPPPPPPPPPPPPPP752", null)),
        new Asset("ETC", "Ethereum classic", null, new Account("GORRILA", null))
    ];

    AddCustomAsset(assetCode: string, issuerAddress: string): Asset {
        if (null === assetCode || null == issuerAddress) {
            throw Error("Both input parameters for asset are NULL!");
        }
        if ("PLZ" === assetCode && "GNatioanlBankOfPoland" === issuerAddress) {
            return null;
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
}
