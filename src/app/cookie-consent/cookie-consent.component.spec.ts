import { async, TestBed, inject } from '@angular/core/testing';

import { CookieConsentComponent } from './cookie-consent.component';
import { NebularService } from '../services/nebular.service';

describe('CookieConsentComponent', () => {

  beforeEach(async(() => {
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
