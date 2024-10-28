import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie';

import { NebularService } from './nebular.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe("NebularService", () => {
  let injector: TestBed;
  let service: NebularService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [
        NebularService,
        {
            provide: CookieService,
            useValue: {
                get: (key) => "",
                put: (key, value, options) => { return; }
            }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    injector = getTestBed();
    service = injector.get(NebularService);
    httpMock = injector.get(HttpTestingController);
  });

    
  it("#getTopVolumeExchanges() performs GET request to API and parses response JSON", () => {
    service.getTopVolumeExchanges().subscribe(data => {
      expect(data).toEqual({ timestamp: "2020-02-20T20:20:20.202", topExchanges: [] });
    });

    const req = httpMock.expectOne(req => req.url.endsWith("/api/topExchanges"));
    expect(req.request.method).toBe('GET');
    req.flush(`{
            "timestamp": "2020-02-20T20:20:20.202",
            "topExchanges": [ ]
        }`);
  });

  it("gets user's agreement with cookie usage", () => {
    const cookieService = TestBed.get(CookieService);
    const cookieSpy = spyOn(cookieService, "get").and.returnValue("true");

    const agreed = service.CookieAgreement;

    expect(agreed).toBe(true);
    expect(cookieSpy).toHaveBeenCalledWith("agr");
  });

  it("can save user's agreement with cookie usage", () => {
    const cookieService = TestBed.get(CookieService);
    const cookieSpy = spyOn(cookieService, "put").and.callFake(() => { return; });

    service.CookieAgreement = true;

    expect(cookieSpy).toHaveBeenCalledWith("agr", "true", jasmine.any(Object));
  });
});
