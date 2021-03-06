import { Injectable } from '@angular/core';
import { CookieService, CookieOptions } from 'ngx-cookie';

import { Account } from "../model/account.model";
import { Asset, KnownAssets } from '../model/asset.model';
import { ExchangePair } from '../model/exchange-pair.model';


@Injectable({
    providedIn: 'root'
})
export class AssetService {
    private readonly _commonAssets: Asset[] = [         //TODO: load from backend, just very short basic list
        KnownAssets.XLM,
        KnownAssets["BTC-NaoBTC"],
        KnownAssets["BTC-Papaya"],
        KnownAssets["CNY-RippleFox"],
        KnownAssets["ETH-Papaya"],
        KnownAssets.EURT,
        KnownAssets.MOBI,
        KnownAssets.RMT,
        KnownAssets.SLT
    ];
    private _commonAssetCodes: string[] = new Array<string>();
    private _commonAnchors: Account[] = new Array<Account>();
    private _customAnchors: Account[] = new Array<Account>();

    /** User's custom defined assets */
    readonly customAssets: Asset[];    
    /** Return custom exchanges (i.e. array of ExchangePair objects) defined by the user */
    readonly customExchanges: ExchangePair[];


    constructor(private readonly cookieService: CookieService) {
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

        this.customAssets = this.loadAssets();
        this.loadAnchors();
        this.customExchanges = this.loadExchanges();
    }


    /** Get array of asset codes available to the user (i.e. basic ones + from user's custom assets). */
    getAssetCodesForExchange(): string[] {
        const codes: string[] = this._commonAssetCodes.slice();
        for (let i = 0; i < this.customAssets.length; i++) {
            //Filter out overlaps
            if (-1 === codes.indexOf(this.customAssets[i].code)) {
                codes.push(this.customAssets[i].code);
            }
        }

        return codes;
    }

    /** All anchors, i.e. common + user defined (even if they aren't used in a custom asset) */
    getAllAnchors(): Account[] {
        return this._commonAnchors.concat(this._customAnchors);
    }

    /** Get array of assets available to the user (i.e. common assets + user's custom assets) */
    getAvailableAssets(): Asset[] {
        return this._commonAssets.concat(this.customAssets);
    }

    /**
     * Returns all available anchors issuing given asset code.
     * @param assetCode Asset code, ideally one from available assets
     */
    GetIssuersByAssetCode(assetCode: string): Account[] {
        const issuers: Account[] = new Array();
        const assets = this.getAvailableAssets();
        for (let i=0; i<assets.length; i++) {
            if (assetCode === assets[i].code) {
                issuers.push(assets[i].issuer);
            }
        }

        return issuers;
    }

    /**
     * Return first anchor from that issues given asset code or NULL if there's no such among available anchors
     * @param assetCode Asset code
     */
    getFirstIssuerAddress(assetCode: string): string {
        const assets = this.getAvailableAssets();
        for (let i=0; i<assets.length; i++) {
            if (assetCode === assets[i].code) {
                return assets[i].issuer.address;
            }
        }

        return null;
    }

    /** Return anchor with given address or NULL if there's no such among available anchors  */
    GetIssuerByAddress(address: string): Account {
        //NOTE: user can register a known anchor. In that case first mathing address is returned
        const anchors: Array<Account> = this.getAllAnchors();          
        for (let i=0; i<anchors.length; i++) {
            if (address === anchors[i].address) {
                return anchors[i];
            }
        }

        return null;
    }

    /**
     * Add new asset with given code and issuer's address
     * @param assetCode - existing asset code
     * @param issuerAddress - address of an anchor
     * @param issuerDomain - anchor web domain
     * @returns - returns newly created asset in case of success, otherwise null
     */
    AddCustomAsset(assetCode: string, issuerAddress: string, issuerDomain: string = null, imageUrl: string = null): Asset {
        //Don't add if it's already there
        for (let i=0; i<this.customAssets.length; i++) {
            if (assetCode === this.customAssets[i].code && issuerAddress === this.customAssets[i].issuer.address) {
                return null;
            }
        }
        //Try to match the address with known issuer.
        let issuer = null;
        const anchors = this.getAllAnchors();
        for (let a=0; a<anchors.length; a++) {
            if (issuerAddress === anchors[a].address) {
                issuer = anchors[a];
                break;
            }
        }

        //Not a problem if issuer's not found (user might have deleted anchor meanwhile), simply crate a dummy
        if (null === issuer) {
            issuer = new Account(issuerAddress, issuerDomain);
        }

        const newAsset = new Asset(assetCode, assetCode, null, issuer, imageUrl);
        this.customAssets.push(newAsset);
        this.serializeToCookie();

        return newAsset;
    }

    /**
     * Remove existing asset with given code and issuer's address
     * @param assetCode - asset code of a known asset
     * @param issuerAddress - address of an anchor
     * @returns {boolean} - true on success, false if given asset is not registered here
     */
    RemoveCustomAsset(assetCode: string, issuerAddress: string): boolean {
        for (var i=0; i<this.customAssets.length; i++) {
            if (this.customAssets[i].code === assetCode && this.customAssets[i].issuer.address === issuerAddress) {
                this.customAssets.splice(i, 1);
                this.serializeToCookie();
                return true;
            }
        }
        //Asset isn't registered here
        return false;
    }

    /** @public Add dummy pair (XLM/XLM) to custom exchanges, return the instance. */
    CreateCustomExchange(): ExchangePair {
        const id = (new Date()).getTime().toString();
        const newExchange = new ExchangePair(id, KnownAssets.XLM, KnownAssets.XLM);
        this.customExchanges.push(newExchange);
        this.serializeToCookie();

        return newExchange;
    }

    /**
     * Change custom exchange with given ID
     * @public
     * @returns {ExchangePair} updated instance
     */
    UpdateCustomExchange(exchangeId: string, baseAsset: Asset, counterAsset: Asset): ExchangePair {
        for (let i=0; i<this.customExchanges.length; i++) {
            if (this.customExchanges[i].id === exchangeId) {
                this.customExchanges[i] = new ExchangePair(exchangeId, baseAsset, counterAsset);
                this.serializeToCookie();
                return this.customExchanges[i];
            }
        }

        return null;
    }

    /** @public Delete exchange by its ID in the array of custom exchanges */
    RemoveCustomExchange(exchangeId: string): boolean {
        for (let i=0; i<this.customExchanges.length; i++) {
            if (this.customExchanges[i].id === exchangeId) {
                this.customExchanges.splice(i, 1);
                this.serializeToCookie();
                return true;
            }
        }

        return false;
    }

    /**
     * Swap positions of saved custom exchanges.
     */
    SwapCustomExchanges(exch1: ExchangePair, exch2: ExchangePair) {
        let exch1Index: number;
        let exch2Index: number;

        for (let i=0; i<this.customExchanges.length; i++) {
            if (this.customExchanges[i].id === exch1.id) {
                exch1Index = i;
            }
            else if (this.customExchanges[i].id === exch2.id) {
                exch2Index = i;
            }
        }

        this.customExchanges[exch1Index] = exch2;
        this.customExchanges[exch2Index] = exch1;
        this.serializeToCookie();
    }

    /**
     * Get issuer by their Stellar address
     * @param issuerAddress public key of an issuer
     * @returns first issuer with given address or NULL if no such is registered here
     */
    private getAnchorByAddress(issuerAddress: string): Account {
        const allAnchors: Account[] = this.getAllAnchors();
        for (let i=0; i<allAnchors.length; i++) {
            if (issuerAddress === allAnchors[i].address) {
                return allAnchors[i];
            }
        }

        //Anchor not found among know issuers. Don't give up and create a dummy one
        return new Account(issuerAddress, null);
    }

    /**
     * Load and return custom anchor accounts (name+domain) as extracted from user's assets.
     * @return Array of Account instances
     */
    private loadAnchors() {
        this._customAnchors = new Array<Account>();
        //Also performs UNION with _commonAnchors to ease further processing
        for (let asset of this.customAssets) {
            if (asset.issuer &&
                -1 === this._customAnchors.findIndex(iss => iss.address === asset.issuer.address) &&
                -1 === this._commonAnchors.findIndex(anch => anch.address === asset.issuer.address)) {
                    this._customAnchors.push(asset.issuer);
            }
        }

/*DEL
        const COOKIE_NAME = "iss";
        const customIssuers = new Array();
        const cookieText: string = this.cookieService.get(COOKIE_NAME) || "";

        const anchors = cookieText.split(",");
        for (let a=0; a<anchors.length; a++) {
            if ((anchors[a] || "").length <= 0) {
                continue;
            }
            const anchorText = decodeURIComponent(anchors[a]).trim();      //TODO: Do we need the encode/decode stuff? ngx-cookie may do it already
            const dashIndex = anchorText.indexOf("/");
            const address = anchorText.substr(0, dashIndex);
            const domain = anchorText.substr(dashIndex+1);
            customIssuers.push(new Account(address, domain));
        }

        return customIssuers;
*/
    }

    /** Loads user's custom defined assets (code + anchor) */
    private loadAssets(): Asset[] {
        const COOKIE_NAME = "ass";
        const customAssets = new Array();
        const cookieText = this.cookieService.get(COOKIE_NAME) || "";

        const assets = cookieText.split(",");
        for (let a=0; a<assets.length; a++) {
            if ((assets[a] || "").length <= 0) {
                continue;
            }
            const assetText = assets[a].trim();
            const parts = assetText.split("|");
            const assetCode = parts[0];
            const issuerAddress = parts[1];
            const domain = parts[2] || null;
            const imageUrl = parts[3];
            const issuer = this.getAnchorByAddress(issuerAddress);
            issuer.domain = domain;         //TODO: is this necessary if we've been able to retrieve the anchor from database?
            customAssets.push(new Asset(assetCode, assetCode, null, issuer, imageUrl));
        }

        return customAssets;
    }

    /**
     * Load user's custom exchanges
     * @returns {Array} array of ExchangePair instances
     */
    private loadExchanges() {
        const COOKIE_NAME = "exc";
        const userExchanges = new Array<ExchangePair>();
        const cookieText = this.cookieService.get(COOKIE_NAME) || "";

        const exchanges = cookieText.split(",");
        for (let e=0; e<exchanges.length; e++) {
            if ((exchanges[e] || "").length <= 0) {
                continue;
            }
            const exchangeText = exchanges[e].trim();      //Format: 5366025104#USD-GABCDEFGH/XLM
            const hashtagIndex = exchangeText.indexOf("#");
            const id = exchangeText.substr(0, hashtagIndex);
            const slashIndex = exchangeText.indexOf("/");
            //Base asset
            const baseAssetText = exchangeText.substring(hashtagIndex+1, slashIndex);
            let dashIndex = baseAssetText.indexOf("-");
            const baseAssetCode = dashIndex > 0 ? baseAssetText.substr(0, dashIndex) : baseAssetText/*XLM*/;
            const baseIssuerAddress = dashIndex > 0 ? baseAssetText.substr(dashIndex+1) : null/*native*/;
            const baseIssuer = this.getAnchorByAddress(baseIssuerAddress);
            const baseAsset = new Asset(baseAssetCode, baseAssetCode, null, baseIssuer);
            //Counter asset
            const counterAssetText = exchangeText.substr(slashIndex+1);
            dashIndex = counterAssetText.indexOf("-");
            const counterAssetCode = dashIndex > 0 ? counterAssetText.substr(0, dashIndex) : counterAssetText;
            const counterIssuerAddress = dashIndex > 0 ? counterAssetText.substr(dashIndex+1) : null/*native*/;
            const counterIssuer = this.getAnchorByAddress(counterIssuerAddress);
            const counterAsset = new Asset(counterAssetCode, counterAssetCode, null, counterIssuer);

            userExchanges.push(new ExchangePair(id, baseAsset, counterAsset));
        }

        return userExchanges;
    }

    private serializeToCookie() {
        let cookieText = "";
        var i = 0;

        //Assets
        cookieText = "";
        for (i=0; i<this.customAssets.length; i++) {
            const asset = this.customAssets[i];
            if (i>0) {
                cookieText += ",";
            }
            //Format "asset_code|issuer_address|ussuer_domain|asset_image"
            cookieText += asset.code + "|" + asset.issuer.address + "|" + asset.issuer.domain + "|" + asset.imageUrl;
        }
        this.setCookieValue("ass", cookieText);

        //Exchanges
        cookieText = "";
        for (let e=0; this.customExchanges != null && e<this.customExchanges.length; e++) {
            const exchange = this.customExchanges[e];
            if (e>0) {
                cookieText += ",";
            }
            //Format 99012367#ABC-GGGGGGGGGG/XYZ-GA2222222222222222
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
