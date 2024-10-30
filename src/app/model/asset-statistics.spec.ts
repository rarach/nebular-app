import { Observable, of, throwError } from 'rxjs';

import { AssetStatistics } from './asset-statistics';
import { Constants } from './constants';
import { HorizonRestService } from '../services/horizon-rest.service';
import { IssuerConfiguration } from './toml/issuer-configuration';
import { TomlConfigService } from '../services/toml-config.service';
import { TomlAsset } from './toml/toml-asset';

describe('AssetStatistics', () => {
  it('#constructor sets asset icon to "UNKNONW" when it`s unavailable', () => {
    //arrange
    const tomlConfigServiceStub = {
      getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
        const issuerConfig = {
          currencies: [ ]
        } as unknown as IssuerConfiguration;
        return of(issuerConfig);
      }
    } as TomlConfigService;

    //act
    const assetStats = new AssetStatistics(new HorizonRestServiceStub() as HorizonRestService, tomlConfigServiceStub, new Set(), 'ABC', 'GBDEV3333');

    //assert
    expect(assetStats.assetTitle).toBe('ABC-asdf.com');
    expect(assetStats.assetIcon).toBe('./assets/images/asset_icons/unknown.png');
  });

  it('#constructor sets asset icon to "unknown" when unable to download it', () => {
    //arrange
    const tomlConfigServiceStub = {
      getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
        return throwError(() => new Error('Cannot read this stellar.toml'));
      }            
    } as TomlConfigService;

    //act
    const assetStats = new AssetStatistics(new HorizonRestServiceStub() as HorizonRestService, tomlConfigServiceStub, new Set(), 'XYZ', 'GBDEV3333');

    //assert
    expect(assetStats.assetIcon).toBe(Constants.UNKNOWN_ASSET_IMAGE);
  });

  it('#constructor sets asset`s title and icon only by ID when config file URL is unknown', () => {
    //arrange
    const horizonServiceStub = {
      getIssuerConfigUrl(assetCode: string, assetIssuer: string) : Observable<string|null> {
        return of(null);
      }          
    } as HorizonRestService;

    //act
    const assetStats = new AssetStatistics(horizonServiceStub, null!, new Set(), 'OOO', 'GBUYYBXWCLT2MOSSHRFCKMEDFOVSCAXNIEW424GLN666OEXHAAWBDYMX');

    //assert
    expect(assetStats.assetTitle).toBe('OOO-GBUYYBXW...AAWBDYMX');
    expect(assetStats.assetIcon).toBe('./assets/images/asset_icons/OOO.png');
  });

  it('#constructor sets "hidden" to FALSE when asset full title not found in filter-list', () => {
    //arrange
    const tomlConfigServiceStub = {
      getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
        const issuerConfig = {
          currencies: [ {code: 'USDX', issuer: 'GAMIFED', image: '/usdx.jpg' } as TomlAsset ]
        } as unknown as IssuerConfiguration;
        return of(issuerConfig);
      }
    } as TomlConfigService;
    const filterList = new Set<string>(['-stellar', 'ASDF', 'usdx-asdf', 'asdf.net']);

    //act
    const assetStats = new AssetStatistics(new HorizonRestServiceStub() as HorizonRestService, tomlConfigServiceStub, filterList, 'USDX', 'GAMIFED');

    //assert
    expect(assetStats.assetIcon).toBe('/usdx.jpg');
    expect(assetStats.hidden).toBeFalse();
  });
  
  it('#constructor sets "hidden" to TRUE when asset full title found in filter-list', () => {
    //arrange
    const tomlConfigServiceStub = {
      getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
        const issuerConfig = {
          currencies: [ {code: 'USDX', issuer: 'GAMIFED', image: '/usdx.jpg' } as TomlAsset ]
        } as unknown as IssuerConfiguration;
        return of(issuerConfig);
      }
    } as TomlConfigService;
    const filterList = new Set<string>(['-stellar', 'ASDF', 'USDX-asd', 'asdf.net']);

    //act
    const assetStats = new AssetStatistics(new HorizonRestServiceStub() as HorizonRestService, tomlConfigServiceStub, filterList, 'USDX', 'GAMIFED');

    //assert
    expect(assetStats.assetIcon).toBe('/usdx.jpg');
    expect(assetStats.hidden).toBeTrue();
  });
});


export class HorizonRestServiceStub {
  getIssuerConfigUrl(assetCode: string, assetIssuer: string) : Observable<string> {
    return of("https://asdf.com/stellar.toml");
  }
}
