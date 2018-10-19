import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeAnalyticsComponent } from './exchange-analytics.component';

describe('ExchangeAnalyticsComponent', () => {
  let component: ExchangeAnalyticsComponent;
  let fixture: ComponentFixture<ExchangeAnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExchangeAnalyticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
