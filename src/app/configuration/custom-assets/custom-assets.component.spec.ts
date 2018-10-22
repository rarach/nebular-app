import { async, inject, TestBed } from '@angular/core/testing';

import { CustomAssetsComponent } from './custom-assets.component';
import { ActivatedRoute } from '@angular/router';
import { AssetService } from 'src/app/services/asset.service';
import { Asset } from 'src/app/model/asset.model';
import { Account } from 'src/app/model/account.model';


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
    //TODO: the rest...
});

class AssetServiceStub {
    customAssets = [
        new Asset("GBP", "Sterling pound", null, new Account("GBPPPPPPPPPPPPPPPPP752", null, null)),
        new Asset("ETC", "Ethereum classic", null, new Account("GORRILA", null, null))
    ];
}