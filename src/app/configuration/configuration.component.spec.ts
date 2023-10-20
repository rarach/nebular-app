import { TestBed, inject, waitForAsync } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { ConfigurationComponent } from './configuration.component';
import { TitleStub } from '../testing/stubs';
import { NebularService } from '../services/nebular.service';


describe('ConfigurationComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Title, useClass: TitleStub },
        {
          provide: NebularService,
          useValue: {
            CookieAgreement: true
          }
        }
      ]
    })
      .compileComponents();
  }));

  it('should create', inject([NebularService, Title], (nebularService, titleService) => {
    const component = new ConfigurationComponent(nebularService, titleService);
    expect(component).toBeTruthy();
    expect(titleService.title).toBe("Nebular - Configuration");
  }));
});
