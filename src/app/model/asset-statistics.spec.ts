import { Observable, of, throwError } from 'rxjs';

import { AssetStatistics } from './asset-statistics';
import { Constants } from './constants';
import { HorizonRestService } from '../services/horizon-rest.service';
import { IssuerConfiguration } from './toml/issuer-configuration';
import { TomlAsset } from './toml/toml-asset';
import { TomlConfigService } from '../services/toml-config.service';


describe('AssetStatistics', () => {
    //TODO: The positive case of constructor

    it('#constructor tries to guess asset icon from basic set when it`s unavailable', () => {
        const tomlConfigServiceStub = {
            getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
                const issuerConfig = {
                    currencies: [ ]
                } as IssuerConfiguration;
                return of(issuerConfig);
            }
        } as TomlConfigService;

        const assetStats = new AssetStatistics(new HorizonRestServiceStub() as HorizonRestService, tomlConfigServiceStub, 'ABC', 'GBDEV3333');

        expect(assetStats.assetTitle).toBe('ABC-asdf.com');
        expect(assetStats.assetIcon).toBe('./assets/images/asset_icons/ABC.png');
    });

    it('#constructor sets asset icon to "unknown" when unable to download it', () => {
        const tomlConfigServiceStub = {
            getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
                return throwError(() => new Error('Cannot read this stellar.toml'));
            }            
        } as TomlConfigService;

        const assetStats = new AssetStatistics(new HorizonRestServiceStub() as HorizonRestService, tomlConfigServiceStub, 'XYZ', 'GBDEV3333');

        expect(assetStats.assetIcon).toBe(Constants.UNKNOWN_ASSET_IMAGE);
    });

    it('#constructor sets asset`s title and icon only by ID when config file URL is unknown', () => {
        const horizonServiceStub = {
            getIssuerConfigUrl(assetCode: string, assetIssuer: string) : Observable<string> {
                return of(null);
            }          
        } as HorizonRestService;

        const assetStats = new AssetStatistics(horizonServiceStub, null, 'OOO', 'GBUYYBXWCLT2MOSSHRFCKMEDFOVSCAXNIEW424GLN666OEXHAAWBDYMX');

        expect(assetStats.assetTitle).toBe('OOO-GBUYYBXW...AAWBDYMX');
        expect(assetStats.assetIcon).toBe('./assets/images/asset_icons/OOO.png');
    });
});


export class HorizonRestServiceStub {
    getIssuerConfigUrl(assetCode: string, assetIssuer: string) : Observable<string> {
        return of("https://asdf.com/stellar.toml");
    }
}
