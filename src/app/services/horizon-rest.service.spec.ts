import { TestBed, getTestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HorizonRestService } from './horizon-rest.service';
import { ExchangePair } from '../model/exchange-pair.model';
import { Asset, KnownAssets } from '../model/asset.model';
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

    it("#getTradeAggregations(exch, 84) performs GET request to correct API URL", () => {
        service.getTradeAggregations(exchange, 123000, 84).subscribe(data => {
            expect(data).toEqual({ asdf: "jkl;", or: 123 });
        });

        const req = httpMock.expectOne(req => req.url.endsWith("/trade_aggregations" +
                                       "?base_asset_code=XRP&base_asset_type=credit_alphanum4" +
                                       "&base_asset_issuer=GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P" +
                                       "&counter_asset_code=HUHU&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GDENIM784152" +
                                       "&order=desc&resolution=123000&limit=84"));
        expect(req.request.method).toBe('GET');
        req.flush({ asdf: "jkl;", or:123});
    });
    it("#getTradeAggregations(exch) performs GET request to correct API URL with default limit", () => {
        service.getTradeAggregations(exchange, 550000).subscribe(data => {
            expect(data).toEqual({ a:"b", c:9 });
        });

        const req = httpMock.expectOne(req => req.url.endsWith("/trade_aggregations" +
                                       "?base_asset_code=XRP&base_asset_type=credit_alphanum4" +
                                       "&base_asset_issuer=GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P" +
                                       "&counter_asset_code=HUHU&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GDENIM784152" +
                                       "&order=desc&resolution=550000&limit=96"));
        expect(req.request.method).toBe('GET');
        req.flush({ a:'b', c:9 });
    });

    it("#getTradeHistory(exch, 135) performs GET request to correct API URL", () => {
        const exch = new ExchangePair("whatever", KnownAssets.XLM, KnownAssets.STEM);
        service.getTradeHistory(exch, 135).subscribe(data => {
            expect(data).toEqual({ asdf: "whatever", jkl: 0.0000005 });
        });

        const req = httpMock.expectOne(req => req.url.endsWith("/trades" +
                                       "?base_asset_code=XLM&base_asset_type=native&base_asset_issuer=null" +
                                       "&counter_asset_code=STEM&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GAFXX2VJE2EGLLY3EFA2BQXJADAZTNR7NC7IJ6LFYPSCLE7AI3AK3B3M" +
                                       "&order=desc&limit=135"));
        expect(req.request.method).toBe('GET');
        req.flush({ asdf: "whatever", jkl:.0000005 });
    });
    it("#getTradeHistory(exch) performs GET request to correct API URL", () => {
        const exch = new ExchangePair("whatever", KnownAssets["CNY-RippleFox"], KnownAssets["USD-AnchorUsd"]);
        service.getTradeHistory(exch).subscribe(data => {
            expect(data).toEqual({ asdf: "get trade history", xxx:958584041 });
        });

        const req = httpMock.expectOne(req => req.url.endsWith("/trades" +
                                       "?base_asset_code=CNY&base_asset_type=credit_alphanum4" +
                                       "&base_asset_issuer=GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX" +
                                       "&counter_asset_code=USD&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX" +
                                       "&order=desc&limit=40"));
        expect(req.request.method).toBe('GET');
        req.flush({ asdf: "get trade history", xxx:958584041 });
    }); 

    it("#getOrderbook(exch, 4) performs GET request to correct API URL", () => {
        const exch = new ExchangePair("whatever", KnownAssets.XCN, KnownAssets.WSE);
        service.getOrderbook(exch, 4).subscribe(data => {
            expect(data).toEqual({ called: "order-book", float:-999999999 });
        });

        const req = httpMock.expectOne(req => req.url.endsWith("/order_book" +
                                       "?selling_asset_code=XCN&selling_asset_type=credit_alphanum4" +
                                       "&selling_asset_issuer=GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY" +
                                       "&buying_asset_code=WSE&buying_asset_type=credit_alphanum4" +
                                       "&buying_asset_issuer=GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V" +
                                       "&limit=4"));
        expect(req.request.method).toBe('GET');
        req.flush({ called: "order-book", float:-999999999 });
    });
    it("#getOrderbook(exch) performs GET request to correct API URL", () => {
        const exch = new ExchangePair("whatever", KnownAssets.XCN, KnownAssets.XTC);
        service.getOrderbook(exch).subscribe(data => {
            expect(data).toEqual({ called: "order-book", float:854125.1515 });
        });

        const req = httpMock.expectOne(req => req.url.endsWith("/order_book" +
                                       "?selling_asset_code=XCN&selling_asset_type=credit_alphanum4" +
                                       "&selling_asset_issuer=GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY" +
                                       "&buying_asset_code=XTC&buying_asset_type=credit_alphanum4" +
                                       "&buying_asset_issuer=GDVJQHR5JZIGW76WBQREFMTYZ3JAKLSX2JTNT2P6DI4M7JR7VHUCNODY" +
                                       "&limit=17"));
        expect(req.request.method).toBe('GET');
        req.flush({ called: "order-book", float:854125.1515 });
    });
});
