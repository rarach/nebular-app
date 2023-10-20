import { fakeAsync, tick, TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { Account } from '../model/account.model';
import { Asset, KnownAssets } from '../model/asset.model';
import { AssetData } from '../model/asset-data.model';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from './horizon-rest.service';


describe('HorizonRestService', () => {
  let injector: TestBed;
  let service: HorizonRestService;
  let httpMock: HttpTestingController;
  const exchange = new ExchangePair("gyuhjk,",
    KnownAssets["XRP-Interstellar"],
    new Asset('HUHU', 'some random coin', null, new Account('GDENIM784152', 'denim.ggg')));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HorizonRestService]
    });
    injector = getTestBed();
    service = injector.inject(HorizonRestService);
    httpMock = injector.inject(HttpTestingController);
  });

  it("#getTradeAggregations(exch, 84) performs GET request to correct API URL", fakeAsync(() => {
    service.getTradeAggregations(exchange, 123000, 84).subscribe(data => {
      expect(data).toEqual({ asdf: "jkl;", or: 123 });
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/trade_aggregations" +
                                       "?base_asset_code=XRP&base_asset_type=credit_alphanum4" +
                                       "&base_asset_issuer=GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P" +
                                       "&counter_asset_code=HUHU&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GDENIM784152" +
                                       "&order=desc&resolution=123000&limit=84"));
    expect(req.request.method).toBe('GET');
    req.flush({ asdf: "jkl;", or:123});
  }));

  it("#getTradeAggregations(exch) performs GET request to correct API URL with default limit", fakeAsync(() => {
    service.getTradeAggregations(exchange, 550000).subscribe(data => {
      expect(data).toEqual({ a:"b", c:9 });
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/trade_aggregations" +
                                       "?base_asset_code=XRP&base_asset_type=credit_alphanum4" +
                                       "&base_asset_issuer=GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P" +
                                       "&counter_asset_code=HUHU&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GDENIM784152" +
                                       "&order=desc&resolution=550000&limit=96"));
    expect(req.request.method).toBe('GET');
    req.flush({ a:'b', c:9 });
  }));

  it("#getTradeHistory(exch, 135) performs GET request to correct API URL", fakeAsync(() => {
    const exch = new ExchangePair("whatever", KnownAssets.XLM, KnownAssets.SLT);
    service.getTradeHistory(exch, 135).subscribe(data => {
      expect(data).toEqual({ asdf: "whatever", jkl: 0.0000005 });
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/trades" +
                                       '?base_asset_code=XLM&base_asset_type=native' +
                                       "&counter_asset_code=SLT&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP" +
                                       "&order=desc&limit=135"));
    expect(req.request.method).toBe('GET');
    req.flush({ asdf: "whatever", jkl:.0000005 });
  }));

  it("#getTradeHistory(exch) performs GET request to correct API URL", fakeAsync(() => {
    const exch = new ExchangePair("whatever", KnownAssets["CNY-RippleFox"], KnownAssets["USD-AnchorUsd"]);
    service.getTradeHistory(exch).subscribe(data => {
      expect(data).toEqual({ asdf: "get trade history", xxx:958584041 });
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/trades" +
                                       "?base_asset_code=CNY&base_asset_type=credit_alphanum4" +
                                       "&base_asset_issuer=GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX" +
                                       "&counter_asset_code=USD&counter_asset_type=credit_alphanum4" +
                                       "&counter_asset_issuer=GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX" +
                                       "&order=desc&limit=40"));
    expect(req.request.method).toBe('GET');
    req.flush({ asdf: "get trade history", xxx:958584041 });
  }));

  it("#getLastPriceInNative() returns last trade price", fakeAsync(() => {
    service.getLastPriceInNative(KnownAssets["USD-AnchorUsd"]).subscribe(priceInXlm => {
      expect(priceInXlm).toBe(1234);
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/trades" +
                                        "?base_asset_code=USD&base_asset_type=credit_alphanum4" +
                                        "&base_asset_issuer=GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX" +
                                        "&counter_asset_code=XLM&counter_asset_type=native" +
                                        "&order=desc&limit=1"));
    expect(req.request.method).toBe("GET");
    req.flush(`{
            "_links": {
            },
            "_embedded": {
              "records": [
                  {
                      "price": {
                          "n": 1234,
                          "d": 1
                      }
                  }
              ]
            }
          }`);
  }));

  it("#getLastPriceInNative() returns -1 if there's no trade for the asset", fakeAsync(() => {
    service.getLastPriceInNative(KnownAssets.SLT).subscribe(priceInXlm => {
      expect(priceInXlm).toBe(-1);
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/trades" +
                                        "?base_asset_code=SLT&base_asset_type=credit_alphanum4" +
                                        "&base_asset_issuer=GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP" +
                                        "&counter_asset_code=XLM&counter_asset_type=native" +
                                        "&order=desc&limit=1"));
    expect(req.request.method).toBe("GET");
    req.flush(`{
            "_links": {
            },
            "_embedded": {
              "records": [
              ]
            }
          }`);
  }));

  it("#getLastPriceInNative() returns -1 if asset's last trade is too old", fakeAsync(() => {
    service.getLastPriceInNative(KnownAssets.MOBI).subscribe(priceInXlm => {
      expect(priceInXlm).toBe(-1);
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/trades" +
                                      "?base_asset_code=MOBI&base_asset_type=credit_alphanum4" +
                                      "&base_asset_issuer=GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH" +
                                      "&counter_asset_code=XLM&counter_asset_type=native" +
                                      "&order=desc&limit=1"));
    expect(req.request.method).toBe("GET");
    req.flush(`{
          "_links": {
          },
          "_embedded": {
            "records": [
              { "ledger_close_time": "2019-09-09T15:34:27Z" }
            ]
          }
        }`);
  }));

  it("#getOrderbook(exch, 4) performs GET request to correct API URL", fakeAsync(() => {
    const exch = new ExchangePair("whatever", KnownAssets.XCN, KnownAssets["XRP-Interstellar"]);
    service.getOrderbook(exch, 4).subscribe(data => {
      expect(data).toEqual({ called: "order-book", float:-999999999 });
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/order_book" +
                                       "?selling_asset_code=XCN&selling_asset_type=credit_alphanum4" +
                                       "&selling_asset_issuer=GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY" +
                                       "&buying_asset_code=XRP&buying_asset_type=credit_alphanum4" +
                                       "&buying_asset_issuer=GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P" +
                                       "&limit=4"));
    expect(req.request.method).toBe('GET');
    req.flush({ called: "order-book", float:-999999999 });
  }));

  it("#getOrderbook(exch) performs GET request to correct API URL", fakeAsync(() => {
    const exch = new ExchangePair("whatever", KnownAssets.XCN, KnownAssets.MOBI);
    service.getOrderbook(exch).subscribe(data => {
      expect(data).toEqual({ called: "order-book", float:854125.1515 });
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/order_book" +
                                       "?selling_asset_code=XCN&selling_asset_type=credit_alphanum4" +
                                       "&selling_asset_issuer=GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY" +
                                       "&buying_asset_code=MOBI&buying_asset_type=credit_alphanum4" +
                                       "&buying_asset_issuer=GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH" +
                                       "&limit=17"));
    expect(req.request.method).toBe('GET');
    req.flush({ called: "order-book", float:854125.1515 });
  }));

  it("#getAssetIssuers() returns null when there are no anchors for an asset code", fakeAsync(() => {
    service.getAssetIssuers("NOSUCH").subscribe(data => {
      expect(data).toBeNull();
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/assets?asset_code=NOSUCH&limit=200"));
    expect(req.request.method).toBe("GET");
    req.flush(`{
            "_embedded": {
              "records": [ ]
            }
          }`);
  }));

  it("#getAssetIssuers() returns correct AssetData array for existing asset code", fakeAsync(() => {
    service.getAssetIssuers("EURT").subscribe(data => {
      expect(data!.length).toBe(1);
      expect(data![0]).toEqual(new AssetData("https://tempo.eu.com/.well-known/stellar.toml",
        "EURT",
        "GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
        10815));
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/assets?asset_code=EURT&limit=200"));
    expect(req.request.method).toBe("GET");
    req.flush(`{
            "_embedded": {
              "records": [
                {
                  "_links": {
                    "toml": {
                      "href": "https://tempo.eu.com/.well-known/stellar.toml"
                    }
                  },
                  "asset_type": "credit_alphanum4",
                  "asset_code": "EURT",
                  "asset_issuer": "GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                  "num_accounts": 10815
                }
              ]
            }
          }`);
  }));

  it("#getIssuerConfigUrl() returns location of TOML file when present", fakeAsync(() => {
    service.getIssuerConfigUrl("GTN", "GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46").subscribe(data => {
      expect(data).toBe("https://glitzkoin.com/.well-known/stellar.toml");
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/assets?asset_code=GTN&asset_issuer=GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46"));
    expect(req.request.method).toBe("GET");
    req.flush(`{
            "_links": {
              "self": {
                "href": "https://horizon.stellar.org/assets?asset_code=GTN\u0026asset_issuer=GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46\u0026cursor=\u0026limit=10\u0026order=asc"
              },
              "next": {
                "href": "https://horizon.stellar.org/assets?asset_code=GTN\u0026asset_issuer=GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46\u0026cursor=GTN_GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46_credit_alphanum4\u0026limit=10\u0026order=asc"
              },
              "prev": {
                "href": "https://horizon.stellar.org/assets?asset_code=GTN\u0026asset_issuer=GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46\u0026cursor=GTN_GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46_credit_alphanum4\u0026limit=10\u0026order=desc"
              }
            },
            "_embedded": {
              "records": [
                {
                  "_links": {
                    "toml": {
                      "href": "https://glitzkoin.com/.well-known/stellar.toml"
                    }
                  },
                  "asset_type": "credit_alphanum4",
                  "asset_code": "GTN",
                  "asset_issuer": "GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46",
                  "paging_token": "GTN_GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46_credit_alphanum4",
                  "amount": "998999327.9096000",
                  "num_accounts": 13794,
                  "flags": {
                    "auth_required": false,
                    "auth_revocable": false,
                    "auth_immutable": false
                  }
                }
              ]
            }
          }`);
  }));

  it("#getIssuerConfigUrl() returns null if asset is not found", fakeAsync(() => {
    service.getIssuerConfigUrl("ASDF", "GASDF").subscribe(data => {
      expect(data).toBeNull();
    });

    tick(10);

    const req = httpMock.expectOne(req => req.url.endsWith("/assets?asset_code=ASDF&asset_issuer=GASDF"));
    expect(req.request.method).toBe("GET");
    req.flush(`{
            "_links": {
              "self": {
                "href": "https://horizon.stellar.org/assets?asset_code=ASDF\u0026asset_issuer=GASDF\u0026cursor=\u0026limit=10\u0026order=asc"
              },
              "next": {
                "href": "https://horizon.stellar.org/assets?asset_code=ASDF\u0026asset_issuer=GASDF\u0026cursor=ASDF_GASDF_credit_alphanum4\u0026limit=10\u0026order=asc"
              },
              "prev": {
                "href": "https://horizon.stellar.org/assets?asset_code=ASDF\u0026asset_issuer=GASDF\u0026cursor=ASDF_GASDF_credit_alphanum4\u0026limit=10\u0026order=desc"
              }
            },
            "_embedded": {
              "records": [
              ]
            }
          }`);
  }));
});
