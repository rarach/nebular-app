import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAssetCodesComponent } from './custom-asset-codes.component';

describe('CustomAssetCodesComponent', () => {
  let component: CustomAssetCodesComponent;
  let fixture: ComponentFixture<CustomAssetCodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomAssetCodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomAssetCodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
