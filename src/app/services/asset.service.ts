import { Injectable } from '@angular/core';
import { CookieOptions, CookieService } from 'ngx-cookie';

import { Account } from "../model/account.model";
import { Asset, KnownAssets } from '../model/asset.model';
import { Constants } from '../model/constants';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from './horizon-rest.service';
import { TomlConfigService } from './toml-config.service';
import { Utils } from '../utils';


@Injectable({
    providedIn: 'root'
})
export class AssetService {
    private readonly _commonAssets: Asset[] = [         //TODO: load from backend, just very short basic list
        KnownAssets.XLM,
        KnownAssets['BTC-Interstellar'],
        KnownAssets["CNY-RippleFox"],
        KnownAssets.EURT,
        KnownAssets.MOBI,
        KnownAssets.SLT
    ];

    /** User's custom defined assets */
    public readonly customAssets: Asset[];    
    /** Return custom exchanges (i.e. array of ExchangePair objects) defined by the user */
    public readonly customExchanges: ExchangePair[];


    constructor(
        private readonly cookieService: CookieService,
        private readonly horizonService: HorizonRestService,
        private readonly configService: TomlConfigService) {
        this.customAssets = this.loadAssets();
        this.customExchanges = this.loadExchanges();
    }


    public get availableAssets(): Asset[] {
        return this._commonAssets.concat(this.customAssets);
    }

    /** Retrieve asset reference based on its ID. The ID has form CODE-ISSUER_ADDRESS */
    public getAsset(assetId: string): Asset {
        if (Constants.NATIVE_ASSET_CODE === assetId) {
            return KnownAssets.XLM;
        }

        //TODO: the parsings start to disturb me. What if we have a hash-map with the asset ID as key?
        const index = assetId.indexOf("-");

        if (index <= 0) {
            throw new Error('Invalid asset identification: ' + assetId);
        }
        const assetCode = assetId.substr(0, index);
        const issuerAddress = assetId.substr(index+1);

        //Try to find among known assets
        for(const knownAsset of this.availableAssets) {    //TODO: ideally replace with simple hash-map lookup
            if (assetCode === knownAsset.code && issuerAddress === knownAsset.issuer.address) {
                return knownAsset;
            }
        }

        const anchor = new Account(issuerAddress);
        const asset = new Asset(assetCode, null, null, anchor);

        this.loadAssetData(asset);
        return asset;
    }

    /**
     * Add new asset with given code and issuer's address
     * @param assetCode - existing asset code
     * @param issuerAddress - address of an anchor
     * @param issuerDomain - anchor web domain
     * @returns - returns newly created asset in case of success, otherwise null
     */
    public AddCustomAsset(assetCode: string, issuerAddress: string, issuerDomain: string = null, imageUrl: string = null): Asset {
        //Don't add if it's already there
        for (let i=0; i<this.customAssets.length; i++) {
            if (assetCode === this.customAssets[i].code && issuerAddress === this.customAssets[i].issuer.address) {
                return null;
            }
        }

        const issuer = new Account(issuerAddress, issuerDomain);
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
    public RemoveCustomAsset(assetCode: string, issuerAddress: string): boolean {
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

    /** Add dummy pair (XLM/XLM) to custom exchanges, return the instance. */
    public CreateCustomExchange(): ExchangePair {
        const id = (new Date()).getTime().toString();
        const newExchange = new ExchangePair(id, KnownAssets.XLM, KnownAssets.XLM);
        this.customExchanges.push(newExchange);
        this.serializeToCookie();

        return newExchange;
    }

    /**
     * Change custom exchange with given ID
     * @returns {ExchangePair} updated instance
     */
    public UpdateCustomExchange(exchangeId: string, baseAsset: Asset, counterAsset: Asset): ExchangePair {
        for (let i=0; i<this.customExchanges.length; i++) {
            if (this.customExchanges[i].id === exchangeId) {
                this.customExchanges[i] = new ExchangePair(exchangeId, baseAsset, counterAsset);
                this.serializeToCookie();
                return this.customExchanges[i];
            }
        }

        return null;
    }

    /** Delete exchange by its ID in the array of custom exchanges */
    public RemoveCustomExchange(exchangeId: string): boolean {
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
    public SwapCustomExchanges(exch1: ExchangePair, exch2: ExchangePair) {
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


    /** Load full data for a given basic asset definition. */
    private loadAssetData(asset: Asset) {
        asset.fullName = `${asset.code}-${asset.issuer.address}`;
        asset.imageUrl = Constants.UNKNOWN_ASSET_IMAGE;

        this.horizonService.getIssuerConfigUrl(asset.code, asset.issuer.address).subscribe(configUrl => {
            if (configUrl) {
                this.configService.getIssuerConfig(configUrl).subscribe(issuerConfig => {
                    const theAsset = issuerConfig.currencies.find(configAsset => {
                        return configAsset.code === asset.code && configAsset.issuer === asset.issuer.address;
                    });
                    if (theAsset) {
                        if (theAsset.name) {
                            asset.fullName = theAsset.name;
                        }
                        if (theAsset.image) {
                            asset.imageUrl = theAsset.image;
                        }
                    }
                });

                //Derive asset's domain from config URL
                const domain = Utils.parseDomain(configUrl);
                asset.issuer.domain = domain;
            }
        });
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
            const issuer = new Account(issuerAddress, domain)
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

            const baseAssetText = exchangeText.substring(hashtagIndex+1, slashIndex);
            const baseAsset = this.getAsset(baseAssetText);
            const counterAssetText = exchangeText.substr(slashIndex+1);
            const counterAsset = this.getAsset(counterAssetText);

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
