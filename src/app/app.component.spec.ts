import { TestBed, waitForAsync, inject } from '@angular/core/testing';
import { Account } from './model/account.model';
import { AppComponent } from './app.component';
import { Asset } from './model/asset.model';
import { ExchangePair } from './model/exchange-pair.model';
import { RouterTestingModule } from '@angular/router/testing';
import { UiActionsService } from './services/ui-actions.service';

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  beforeEach(inject([UiActionsService], (uiService) => {
    component = new AppComponent(uiService);
  }));

  it('#onClick() should cancel custom exchange reposition', () => {
    const uiService : UiActionsService = TestBed.get(UiActionsService);
    const dummyExch = new ExchangePair('test-exch',
      new Asset('TEST', 'tesomethin', null, new Account('GABRIELSSSSSS096', 'test.org')),
      new Asset('NopE', '', null, new Account('GDDD', 'whet.ever')));
    spyOnProperty(uiService, 'DraggingExchange', 'get').and.returnValue(dummyExch);
    spyOn(uiService, 'draggingFinished').and.callFake(() => { return; });

    component.onClick();

    expect(uiService.draggingFinished).toHaveBeenCalled();
  });
});
