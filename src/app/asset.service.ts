import { Injectable } from '@angular/core';
import { CookieService, CookieOptions } from 'ngx-cookie';

import { Account } from "./model/account.model";
import { Asset, KnownAssets } from './model/asset.model';
import { ExchangePair } from './model/exchange-pair.model';


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
  private _customAssetCodes: string[];
  private _customAnchors: Account[];
  private _customAssets: Asset[];
  private _customExchanges: ExchangePair[];


  constructor(private cookieService: CookieService) {
      this._customAssetCodes = this.loadAssetCodes();
        this._customAnchors = this.loadAnchors();
        this._customAssets = this.loadAssets();
        this._customExchanges = this.loadExchanges();

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

    /** @public Return custom exchanges (i.e. array of ExchangePair objects) defined by the user */
    getCustomExchanges(): ExchangePair[] { return this._customExchanges; }      //TODO: does Angular have public get/private set? Use that instead if yes.

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

    /** Add dummy pair (XLM/XLM) to custom exchanges, return the instance. */
    CreateCustomExchange(): ExchangePair {
        const id = (new Date()).getTime().toString();
        const newExchange = new ExchangePair(id, KnownAssets.XLM, KnownAssets.XLM);
        this._customExchanges.push(newExchange);
        this.serializeToCookie();

        return newExchange;
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
     * Change custom exchange with given ID
     * @public
     * @returns {ExchangePair} updated instance
     */
    UpdateCustomExchange(exchangeId: string, baseAssetCode: string, baseIssuerAddress: string, counterAssetCode: string, counterIssuerAddress: string) {
        for (let i=0; i<this._customExchanges.length; i++) {
            if (this._customExchanges[i].id === exchangeId) {
                const baseAnchor = this.getAnchorByAddress(baseIssuerAddress);
                const counterAnchor = this.getAnchorByAddress(counterIssuerAddress);
                const baseAsset = new Asset(baseAssetCode, baseAssetCode, null, baseAnchor);
                const counterAsset = new Asset(counterAssetCode, counterAssetCode, null, counterAnchor);

                this._customExchanges[i] = new ExchangePair(exchangeId, baseAsset, counterAsset);
                this.serializeToCookie();
                return this._customExchanges[i];
            }
        }

        return null;
    }

    /** @public Delete exchange by its ID in the array of custom exchanges */
    RemoveCustomExchange(exchangeId: string) {
        for (let i=0; i<this._customExchanges.length; i++) {
            if (this._customExchanges[i].id === exchangeId) {
                this._customExchanges.splice(i, 1);
                this.serializeToCookie();
                return true;
            }
        }

        return false;
    }

    private loadAssetCodes(): string[] {
        const COOKIE_NAME = "aco";
        const cookieText: string = this.cookieService.get(COOKIE_NAME) || "";
        const customCodes = new Array();

        const parts = cookieText.split(";");
        for (let i=0; i<parts.length; i++) {
            const part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                const assetCodes = part.substr(COOKIE_NAME.length).split(",");
                for (let a=0; a<assetCodes.length; a++) {
                    if ((assetCodes[a] || "").length <= 0) {
                        continue;
                    }
                    customCodes.push(assetCodes[a]);
                }
            }
        }

        return customCodes;
    }

    /**
     * Load and return user's custom anchor accounts (name+domain).
     * @return Array of Account instances
     */
    private loadAnchors(): Account[] {
        const COOKIE_NAME = "iss";
        const customAnchors = new Array();
        const cookieText: string = this.cookieService.get(COOKIE_NAME) || "";

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
    }

    /** Loads user's custom defined assets (code + anchor) */
    private loadAssets(): Asset[] {
        const COOKIE_NAME = "ass";
        const customAssets = new Array();
        const cookieText = this.cookieService.get(COOKIE_NAME) || "";

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
    }

    /**
     * Load user's custom exchanges
     * @returns {Array} array of ExchangePair instances
     */
    private loadExchanges() {
        const COOKIE_NAME = "exc";
        const userExchanges = new Array();
        const cookieText = this.cookieService.get(COOKIE_NAME) || "";

        const parts = cookieText.split(";");
        for (let i=0; i<parts.length; i++) {
            const part = parts[i].trim();
            if (part.indexOf(COOKIE_NAME) == 0) {
                const exchanges = part.substr(COOKIE_NAME.length).split(",");
                for (let e=0; e<exchanges.length; e++) {
                    if ((exchanges[e] || "").length <= 0) {
                        continue;
                    }
                    const exchangeText = decodeURIComponent(exchanges[e]);      //Format: 5366025104=USD-GABCDEFGH/XLM
                    const hashtagIndex = exchangeText.indexOf("#");
                    const id = exchangeText.substr(0, hashtagIndex);
                    const slashIndex = exchangeText.indexOf("/");
                    //Base asset
                    const baseAssetText = exchangeText.substring(hashtagIndex+1, slashIndex);
                    let dashIndex = baseAssetText.indexOf("-");
                    const baseAssetCode = dashIndex > 0 ? baseAssetText.substr(0, dashIndex) : baseAssetText/*XLM*/;
                    const baseIssuerAddress = dashIndex > 0 ? baseAssetText.substr(dashIndex+1) : null/*native*/;
                    const baseIssuer = this.getAnchorByAddress(baseIssuerAddress);           //BUG: what if the user removed the issuer on Configuration? TODO
                    const baseAsset = new Asset(baseAssetCode, baseAssetCode, null, baseIssuer);
                    //Counter asset
                    const counterAssetText = exchangeText.substr(slashIndex+1);
                    dashIndex = counterAssetText.indexOf("-");
                    const counterAssetCode = dashIndex > 0 ? counterAssetText.substr(0, dashIndex) : counterAssetText;
                    const counterIssuerAddress = dashIndex > 0 ? counterAssetText.substr(dashIndex+1) : null/*native*/;
                    const counterIssuer = this.getAnchorByAddress(counterIssuerAddress);     //BUG: what if the user removed the issuer on Configuration? TODO
                    const counterAsset = new Asset(counterAssetCode, counterAssetCode, null, counterIssuer);

                    userExchanges.push(new ExchangePair(id, baseAsset, counterAsset));
                }
            }
        }

        return userExchanges;
    }

    private serializeToCookie() {
        let cookieText = "";
        //Asset codes
        var i = 0;
        for (i = 0; i<this._customAssetCodes.length; i++) {
            if (i>0) {
                cookieText += ",";
            }
            cookieText += this._customAssetCodes[i];
        }
        this.setCookieValue("aco", cookieText);

        //Anchors
        cookieText = "";
        for (i=0; i<this._customAnchors.length; i++) {
            const anchor = this._customAnchors[i];
            if (i>0) {
                cookieText += ","
            }
            cookieText += encodeURIComponent(anchor.address + "/" + anchor.domain);
        }
        this.setCookieValue("iss", cookieText);

        //Assets
        cookieText = "";
        for (i=0; i<this._customAssets.length; i++) {
            const asset = this._customAssets[i];
            if (i>0) {
                cookieText += ",";
            }
            //Format "asset_code"-"issuer_address"
            cookieText += asset.code + "-" + asset.issuer.address;
        }
        this.setCookieValue("ass", cookieText);

        cookieText = "";
        for (let e=0; this._customExchanges != null && e<this._customExchanges.length; e++) {
            const exchange = this._customExchanges[e];
            if (e>0) {
                cookieText += ",";
            }
            //Format 99012367=ABC-GGGGGGGGGG/XYZ-GA2222222222222222
            cookieText += exchange.id + "#" + exchange.baseAsset.code;
            if (!exchange.baseAsset.IsNative()) {
                cookieText += "-" + exchange.baseAsset.issuer.address;
            }
            cookieText += "/" + exchange.counterAsset.code;
            if (!exchange.counterAsset.IsNative()) {
                cookieText += "-" + exchange.counterAsset.issuer.address;
            }
        }
        this.setCookieValue("exc", cookieText)
    }

    private setCookieValue(key: string, value: string) {
        //Make it expire in 700 days
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 700);
        const options: CookieOptions = {
            expires: expiration
        };

        this.cookieService.put(key, value, options);
    }
}
