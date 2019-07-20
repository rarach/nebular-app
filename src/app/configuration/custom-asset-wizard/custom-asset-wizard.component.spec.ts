import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAssetWizardComponent } from './custom-asset-wizard.component';

describe('CustomAssetWizardComponent', () => {
  let component: CustomAssetWizardComponent;
  let fixture: ComponentFixture<CustomAssetWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomAssetWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomAssetWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
