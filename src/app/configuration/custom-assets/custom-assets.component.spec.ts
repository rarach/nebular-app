import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAssetsComponent } from './custom-assets.component';

describe('CustomAssetsComponent', () => {
  let component: CustomAssetsComponent;
  let fixture: ComponentFixture<CustomAssetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
