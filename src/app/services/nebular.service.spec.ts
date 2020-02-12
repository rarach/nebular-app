import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NebularService } from './nebular.service';


describe("NebularService", () => {
    let injector: TestBed;
    let service: NebularService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NebularService]
        });
        injector = getTestBed();
        service = injector.get(NebularService);
        httpMock = injector.get(HttpTestingController);
    });

    
    it("#getTopVolumeExchanges() performs GET request to API and parses response JSON", () => {
        service.getTopVolumeExchanges().subscribe(data => {
            expect(data).toEqual({ timestamp: "jkl;", topExchanges: [] });
        });

        const req = httpMock.expectOne(req => req.url.endsWith("/api/top_exchanges.json"));
        expect(req.request.method).toBe('GET');
        req.flush('{ timestamp: "2020-02-20T20:20:20.202", topExchanges: [ { baseAsset: "XLM", counterAsset: { code: "asDF"} } ] }');
    });
});
