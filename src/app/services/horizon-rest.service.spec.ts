import { TestBed, getTestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HorizonRestService } from './horizon-rest.service';
import { ExchangePair } from '../model/exchange-pair.model';
import { Asset, KnownAssets } from '../model/asset.model';
import { Constants } from '../model/constants';
import { Account } from '../model/account.model';


describe('HorizonRestService', () => {
    let injector: TestBed;
    let service: HorizonRestService;
    let httpMock: HttpTestingController;
    const exchange = new ExchangePair("gyuhjk,",
                                      KnownAssets["XRP-Interstellar"],
                                      new Asset("HUHU", null, null, new Account("GDENIM784152", "g-denim", "denim.ggg")));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HorizonRestService]
        });
        injector = getTestBed();
        service = injector.get(HorizonRestService);
        httpMock = injector.get(HttpTestingController);
    });

    it("composes correct URL for getTradeAggregations()", () => {
        service.getTradeAggregations(exchange, 123000, 84).subscribe(data => {
            expect(data).toEqual({ asdf: "jkl;", or: 123});
        });

        const req = httpMock.expectOne(`${Constants.API_URL}/trade_aggregations` +
                                       "?base_asset_code=XRP&base_asset_type=credit_alphanum4" +
                                       "&base_asset_issuer=GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P" +
                                       "&counter_asset_code=HUHU&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GDENIM784152" +
                                       "&order=desc&resolution=123000&limit=84");
        expect(req.request.method).toBe('GET');
        req.flush({ asdf: "jkl;", or:123});
    });
    //TODO: the other methods
});
