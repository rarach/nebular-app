import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';

import { AssetService } from 'src/app/services/asset.service';
import { CustomAssetCodesComponent } from './custom-asset-codes.component';

//TODO: do some research to learn how to test the rendered markup

describe('CustomAssetCodesComponent', () => {
    let component: CustomAssetCodesComponent;
    let fixture: ComponentFixture<CustomAssetCodesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
        declarations: [ CustomAssetCodesComponent ],
        imports: [ FormsModule ],
        providers: [{ provide: AssetService, useClass: AssetServiceStub }]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomAssetCodesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should contain list of custom asset codes', () => {
        expect(component.customAssetCodes).toEqual(["ASDF", "JKL;"]);
    });

    it("doesn't save data after submit of invalid form", () => {
        const invalidFormStub = <NgForm>{
            value: { newAssetCode: "I0I0" },
            invalid: true
        }
        component.addAssetCode(invalidFormStub);
        expect(component.latestAddedCode).toBeNull();
        expect(component.duplicateAssetCode).toBeNull();
    });
    it("doesn't save data after submit of empty asset code", () => {
        const invalidFormStub = <NgForm>{
            value: { newAssetCode: "" },
            invalid: false
        }
        component.addAssetCode(invalidFormStub);
        expect(component.latestAddedCode).toBeNull();
        expect(component.duplicateAssetCode).toBeNull();
    });
    it("highlights duplicate asset code", () => {
        const invalidFormStub = <NgForm>{
            value: { newAssetCode: "JKL;" },
            invalid: false
        }
        component.addAssetCode(invalidFormStub);
        expect(component.latestAddedCode).toBeNull();
        expect(component.duplicateAssetCode).toBe("JKL;");
    });
    it("adds new code and emits event", () => {
        const invalidFormStub = <NgForm>{
            value: { newAssetCode: "NEW3333" },
            invalid: false,
            reset: () => {}
        }
        let emitted = false;
        component.assetCodesChanged.subscribe(asdf => {
            emitted = true;
        });
        component.addAssetCode(invalidFormStub);
        expect(component.latestAddedCode).toBe("NEW3333");
        expect(component.duplicateAssetCode).toBeNull();
        expect(emitted).toBeTruthy();
    });
});

class AssetServiceStub {
    customAssetCodes: string[] = ["ASDF", "JKL;"];

    AddCustomAssetCode(code: string): boolean {
        return "NEW3333" === code;
    }
}
