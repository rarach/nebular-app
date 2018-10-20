import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ConfigurationComponent } from './configuration.component';
import { CustomAssetCodesComponent } from './custom-asset-codes/custom-asset-codes.component';
import { CustomAssetsComponent } from './custom-assets/custom-assets.component';
import { CustomIssuersComponent } from './custom-issuers/custom-issuers.component';


describe('ConfigurationComponent', () => {
  let component: ConfigurationComponent;
  let fixture: ComponentFixture<ConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigurationComponent, CustomAssetCodesComponent, CustomAssetsComponent, CustomIssuersComponent ],
      imports: [ FormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
