import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { CookieConsentComponent } from './cookie-consent.component';
import { NebularService } from '../services/nebular.service';

describe('CookieConsentComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: NebularService,
          useValue: { }
        }
      ]
    })
      .compileComponents();
  }));

  it('should create the component', inject([NebularService], (nebularService) => {
    const component = new CookieConsentComponent(nebularService);
    expect(component).toBeTruthy();
  }));
});
