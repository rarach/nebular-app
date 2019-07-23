import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';

import { Account } from 'src/app/model/account.model';
import { AssetService } from 'src/app/services/asset.service';
import { CustomIssuersComponent } from './custom-issuers.component';


describe('CustomIssuersComponent', () => {
    let component: CustomIssuersComponent;
    let fixture: ComponentFixture<CustomIssuersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
        declarations: [ CustomIssuersComponent ],
        imports: [ FormsModule ],
        providers: [{ provide: AssetService, useClass: AssetServiceStub }]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CustomIssuersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should contain custom issuers upon init', () => {
        expect(component.customAnchors).toEqual([
            new Account("GOOGLE8458520", "google.co.uk"),
            new Account("GXXXXXXXXXXXXXX", "example.org")
        ]);
    });

    it("doesn't save data after submit of invalid form", () => {
        const invalidFormStub = <NgForm>{
            value: { newAnchorAddress: "GARFFIELD841265410" },
            invalid: true
        }
        component.addAnchor(invalidFormStub);
        expect(component.lastAddedAddress).toBeNull();
        expect(component.duplicateAddress).toBeNull();
    });
    it("doesn't save data after submit of empty issuer address", () => {
        const invalidFormStub = <NgForm>{
            value: { newAnchorAddress: "" },
            invalid: false
        }
        component.addAnchor(invalidFormStub);
        expect(component.lastAddedAddress).toBeNull();
        expect(component.duplicateAddress).toBeNull();
    });
    it("highlights duplicate issuer", () => {
        const invalidFormStub = <NgForm>{
            value: { newAnchorAddress: "GXXXXXXXXXXXXXX" },
            invalid: false
        }
        component.addAnchor(invalidFormStub);
        expect(component.lastAddedAddress).toBeNull();
        expect(component.duplicateAddress).toBe("GXXXXXXXXXXXXXX");
    });
    it("adds new issuer and emits event", () => {
        const formStub = <NgForm>{
            value: { newAnchorAddress: "GABCDEF5656565656565", newAnchorName: "ThisIsNew" },
            invalid: false,
            reset: () => {}
        }
        let emitted = false;
        component.issuersChanged.subscribe(asdf => {
            emitted = true;
        });
        component.addAnchor(formStub);
        expect(component.lastAddedAddress).toBe("GABCDEF5656565656565");
        expect(component.duplicateAddress).toBeNull();
        expect(emitted).toBeTruthy();
    });
    it("doesn't emit event if adding an issuer failed", () => {
        component.lastAddedAddress = "GA123";
        const formStub = <NgForm>{
            value: { newAnchorAddress: "GAWHATEVER", newAnchorName: "Asset Service will reject this for 'some' reason" },
            invalid: false,
            reset: () => {}
        }
        let emitted = false;
        component.issuersChanged.subscribe(asdf => {
            emitted = true;
        });
        component.addAnchor(formStub);
        expect(component.lastAddedAddress).toBe("GA123");
        expect(component.duplicateAddress).toBeNull();
        expect(emitted).toBe(false);
    });

    it("deletes existing issuer and emits event", () => {
        let emitted = false;
        component.issuersChanged.subscribe(asdf => {
            emitted = true;
        });
        component.removeCustomAnchor("GAAATOREMOVE");
        expect(emitted).toBeTruthy();
    }); 
});


class AssetServiceStub {
    customAnchors: Account[] = [
        new Account("GOOGLE8458520", "google.co.uk"),
        new Account("GXXXXXXXXXXXXXX", "example.org")
    ];

    AddCustomAnchor(address: string, issuerName: string): boolean {
        return "GABCDEF5656565656565" === address && "ThisIsNew" === issuerName;
    }

    RemoveCustomAnchor(address: string): boolean {
        return "GAAATOREMOVE" === address;
    }
}
