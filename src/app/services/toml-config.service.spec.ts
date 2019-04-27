import { HttpTestingController, HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed, getTestBed } from "@angular/core/testing";
import { TomlConfigService } from "./toml-config.service";


describe('TomlConfigService', () => {
    let injector: TestBed;
    let service: TomlConfigService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: TomlConfigService, useClass: TomlConfigService },
                { provide: String, useValue: "google.com/.well-known/stellar.toml"}
            ]
        });
        injector = getTestBed();
        service = injector.get(TomlConfigService);
        httpMock = injector.get(HttpTestingController);
    });

    it("#getIssuerConfig() should retrieve and parse TOML data of an anchor", () => {
        service.getIssuerConfig().subscribe(data => {
            expect(data.currencies.length).toBe(2);
            expect(data.currencies[0].code).toBe("WSD");
            expect(data.currencies[1].desc).toBe("The White Standard Euro is a stable coin 100% backed by and redeemable for EURO");
        });

        const req = httpMock.expectOne(req => req.url === 'google.com/.well-known/stellar.toml');
        expect(req.request.method).toBe("GET");
        req.flush(`# This is fake :-|
[QUORUM_SET]
VALIDATORS=[
"$satoshipay1", "$satoshipay2", "$satoshipay3"
]

[[CURRENCIES]]
code = "WSD"
conditions = "WSD Tokens are issued when $ USD deposits are made and burned when $USD deposits are redeemed"
desc = "The White Standard is a stable coin 100% backed by and redeemable for $USD"
display_decimals = 2
image = "https://www.thewwallet.com/logo"
issuer = "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V"
name = "White Standard Dollar"
anchor_asset_type="fiat"
anchor_asset="USD"
is_asset_anchored = "true"
redemption_instructions = "Redeemable through https://thewwallet.com or through SEP-006 via thewwallet.com API"

[[CURRENCIES]]
code = "WSEUR"
conditions = "WSE Tokens are issued when � EURO deposits are made and burned when EURO deposits are redeemed"
desc = "The White Standard Euro is a stable coin 100% backed by and redeemable for EURO"
display_decimals = 2
image = "https://www.thewwallet.com/logowse"
issuer = "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V"
name = "White Standard Euro"
anchor_asset_type="fiat"
anchor_asset="EUR"
is_asset_anchored = "true"
redemption_instructions = "Redeemable through https://thewwallet.com or through SEP-006 via thewwallet.com API"

[[CURRENCIES]]
code = "FAIL"
desc= "This is incomplete currency definition. Should not pass parsing"
name ="Simply nope"

`);
    });
});
