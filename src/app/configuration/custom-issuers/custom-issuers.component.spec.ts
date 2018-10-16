import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomIssuersComponent } from './custom-issuers.component';

describe('CustomIssuersComponent', () => {
  let component: CustomIssuersComponent;
  let fixture: ComponentFixture<CustomIssuersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomIssuersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomIssuersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
