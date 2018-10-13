import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomExchangeComponent } from './custom-exchange.component';

describe('CustomExchangeComponent', () => {
  let component: CustomExchangeComponent;
  let fixture: ComponentFixture<CustomExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomExchangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
