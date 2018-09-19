import { Injectable } from '@angular/core';
import { Account } from "./model/account.model";
import { Asset, KnownAssets } from './model/asset.model';


@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private readonly _commonAssets: Asset[] = [
    KnownAssets.XLM,
    KnownAssets["BTC-NaoBTC"],
    KnownAssets["BTC-Papaya"],
    KnownAssets["BTC-Stronghold"],
    KnownAssets["BTC-vcbear"],
    KnownAssets["CNY-RippleFox"],
    KnownAssets["ETH-Papaya"],
    KnownAssets["ETH-Stronghold"],
    KnownAssets.EURT,
    KnownAssets.HKDT,
    KnownAssets["LTC-Papaya"],
    KnownAssets.MOBI,
    KnownAssets.NGNT,
    KnownAssets.PHP,
    KnownAssets.REPO,
    KnownAssets.RMT,
    KnownAssets.SLT,
    KnownAssets["USD-Golix"],
    KnownAssets["USD-Stonghold"]
  ];
  private _commonAssetCodes: string[] = new Array<string>();
  private _commonAnchors: Account[] = new Array<Account>();
  private _customAnchors: Account[];
  private _customAssets: Asset[];


  constructor() {
    this._customAnchors = this.loadAnchors();
    this._customAssets = this.loadAssets();

    //Derive common asset codes and anchors from assets
    for (let i=0; i<this._commonAssets.length; i++) {
        //Take asset codes from the common assets
        const assetCode: string = this._commonAssets[i].code;
        if (-1 === this._commonAssetCodes.indexOf(assetCode)) {
            this._commonAssetCodes.push(assetCode);
        }
        //Take anchors from the common assets
        const anchor: Account = this._commonAssets[i].issuer;
        if (-1 === this._commonAnchors.indexOf(anchor)) {
            this._commonAnchors.push(anchor);
        }
    }
  }


  /** Get array of asset codes available to the user (i.e. basic ones + from user's custom assets). */
  getAssetCodesForExchange(): string[] {
    const codes: string[] = this._commonAssetCodes.slice();
    for (let i = 0; i < this._customAssets.length; i++) {
        //Filter out overlaps
        if (-1 === codes.indexOf(this._customAssets[i].code)) {
            codes.push(this._customAssets[i].code);
        }
    }

    return codes;
  };

  /** Get array of assets available to the user (i.e. common assets + user's custom assets) */
  private getAvailableAssets(): Asset[] {
      return this._commonAssets.concat(this._customAssets);
  };

  /**
   * All anchors, i.e. common + user defined (even if they aren't used in a custom asset)
   * @public
   */
  getAllAnchors() {
    return this._commonAnchors.concat(this._customAnchors);
  };

  /**
   * Returns all available anchors issuing given asset code.
   * @param assetCode Asset code, ideally one from available assets
   */
  GetIssuersByAssetCode (assetCode: string) {
    const issuers: Account[] = new Array();
    const assets = this.getAvailableAssets();
    for (let i=0; i<assets.length; i++) {
        if (assetCode === assets[i].code) {
            issuers.push(assets[i].issuer);
        }
    }

    return issuers;
  };

  /**
   * Return first anchor from that issues given asset code or NULL if there's no such among available anchors
   * @param assetCode Asset code
   */
  GetFirstIssuerAddress(assetCode: string): string {
      const assets = this.getAvailableAssets();
      for (let i=0; i<assets.length; i++) {
          if (assetCode === assets[i].code) {
              return assets[i].issuer.address;
          }
      }

      return null;
  };

  /** Return anchor with given address or NULL if there's no such among available anchors  */
  GetIssuerByAddress(address: string) {
    //NOTE: user can register a known anchor. In that case first mathing address is returned
    const anchors: Array<Account> = this.getAllAnchors();          
    for (let i=0; i<anchors.length; i++) {
        if (address === anchors[i].address) {
            return anchors[i];
        }
    }

    return null;
  };

   /**
   * Get issuer by their Stellar address
   * @param issuerAddress public key of an issuer
   * @returns first issuer with given address or NULL if no such is registered here
   */
  private getAnchorByAddress(issuerAddress: string): Account {
    for (let i=0; i<this._customAnchors.length; i++) {
        if (issuerAddress === this._customAnchors[i].address) {
            return this._customAnchors[i];
        }
    }

    //Anchor not found among know issuers. Don't give up and create a dummy one
    return new Account(issuerAddress, null, null);
  }

  /**
   * Load and return user's custom anchor accounts (name+domain).
   * @return Array of Account instances
   */
  private loadAnchors(): Account[] {
    const COOKIE_NAME = "iss=";
    const customAnchors = new Array();
    const cookieText = document.cookie;             //TODO: No! Install ngx-cookie-service and user their get/set
    if (cookieText.length <= 0) {
        return customAnchors;
    }

    const parts = cookieText.split(";");
    for (let i=0; i<parts.length; i++) {
        const part = parts[i].trim();
        if (part.indexOf(COOKIE_NAME) == 0) {
            const anchors = part.substr(COOKIE_NAME.length).split(",");
            for (let a=0; a<anchors.length; a++) {
                if ((anchors[a] || "").length <= 0) {
                    continue;
                }
                const anchorText = decodeURIComponent(anchors[a]);
                const dashIndex = anchorText.indexOf("/");
                const address = anchorText.substr(0, dashIndex);
                const domain = anchorText.substr(dashIndex+1);
                customAnchors.push(new Account(address, domain, domain));
            }
        }
    }

    return customAnchors;
  };

  /** Loads user's custom defined assets (code + anchor) */
   private loadAssets(): Asset[] {
      const COOKIE_NAME = "ass=";
      const customAssets = new Array();
      const cookieText = document.cookie;
      if (cookieText.length <= 0) {
          return customAssets;
      }

      const parts = cookieText.split(";");
      for (let i=0; i<parts.length; i++) {
          const part: string = parts[i].trim();
          if (part.indexOf(COOKIE_NAME) == 0) {
              const assets = part.substr(COOKIE_NAME.length).split(",");
              for (let a=0; a<assets.length; a++) {
                  if ((assets[a] || "").length <= 0) {
                      continue;
                  }
                  const assetText = decodeURIComponent(assets[a]);
                  const dashIndex = assetText.indexOf("-");
                  const assetCode = assetText.substr(0, dashIndex);
                  const issuerAddress = assetText.substr(dashIndex+1);
                  const issuer = this.getAnchorByAddress(issuerAddress);
                  customAssets.push(new Asset(assetCode, assetCode, null, issuer));
              }
          }
      }

      return customAssets;
  };
}
