import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveTradesComponent } from './live-trades.component';

describe('LiveTradesComponent', () => {
  let component: LiveTradesComponent;
  let fixture: ComponentFixture<LiveTradesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveTradesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveTradesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
