import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { Account } from '../model/account.model';
import { ExchangePair } from '../model/exchange-pair.model';
import { KnownAssets, Asset } from '../model/asset.model';
import { TradeHistoryComponent } from './trade-history.component';


describe('TradeHistoryComponent', () => {
  let component: TradeHistoryComponent;
  let fixture: ComponentFixture<TradeHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeHistoryComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeHistoryComponent);
    component = fixture.componentInstance;
    component.exchange = new ExchangePair("84512",
      KnownAssets.SLT,
      new Asset("XXXOR", "xor token", null, new Account("GBRITVA", "what-ever.home")));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  //TODO: make this that kind of test that check rendered markup
});
