import { Account, KnownAccounts } from "./account.model";
import { AssetService } from "../services/asset.service";
import { Constants } from "./constants";


export class Asset {
    constructor(public readonly code: string,
                public fullName: string,
                public readonly type: string,
                public readonly issuer: Account,
                public imageUrl: string = null) {
        this.imageUrl = imageUrl || Constants.UNKNOWN_ASSET_IMAGE;
        this.code = code || Constants.NATIVE_ASSET_CODE;
        if (null === type) {
            if (this.code === Constants.NATIVE_ASSET_CODE && (!issuer || !issuer.address)) {
                this.type = Constants.NATIVE_ASSET_TYPE;
                this.imageUrl = Constants.NATIVE_ASSET_IMAGE;
            }
            else {
                this.type = code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12";
            }
        }
    }

    /** @public Return true for Lumens (XLM) */
    IsNative(): boolean {
        return this.code === Constants.NATIVE_ASSET_CODE && this.type === Constants.NATIVE_ASSET_TYPE;
    }

    ToUrlParameters(prefix: string): string {
        let getParams = prefix + "_asset_code=" + this.code + "&" + prefix + "_asset_type=" + this.type;
        if (this.issuer?.address) {
            getParams += "&" + prefix + "_asset_issuer=" + this.issuer.address;
        }

        return getParams;
    }

    ToExchangeUrlParameter(): string {
        return this.code + (this.type == Constants.NATIVE_ASSET_TYPE ? "" : "-" + this.issuer.address);
    }

    /**
     * Create new Asset instance from its string description
     * @param assetUrlParam asset definition, most likely gotten from URL, in form CODE-STELLAR_ADDRESS_OF_ISSUER
     * @param assetService instance of AssetService
     */
    static ParseFromUrlParam(assetUrlParam: string, assetService: AssetService): Asset {   //TODO: this method doesn't really belong here. When you move it, delete the AssetService dependencies all the way up the call tree
        const index = assetUrlParam.indexOf("-");
        let assetCode;
        let issuerAddress = null;
        let assetType = null;
        if (-1 === index) {
            assetCode = assetUrlParam;
            if (assetUrlParam != Constants.NATIVE_ASSET_CODE) {
                //Try to find issuers of that asset among known accounts
                issuerAddress = assetService.getFirstIssuerAddress(assetUrlParam);
                if (!issuerAddress) {
                    throw "Invalid URL parameters (missing issuer): " + assetUrlParam;
                }
            }
            else assetType = Constants.NATIVE_ASSET_TYPE;   //"native" for XLM
        }
        else {
            assetCode = assetUrlParam.substring(0, index);
            issuerAddress = assetUrlParam.substring(index + 1);
        }
    
        return new Asset(assetCode, null, assetType, new Account(issuerAddress, null));
    }
}


/** "Database" of currently knwon assets on the Stellar network. TODO: load this from backend! */
export const KnownAssets = {
    "XLM" : new Asset("XLM", "Lumen", "native", new Account(null, null), Constants.NATIVE_ASSET_IMAGE),
    "ABDT" : new Asset("ABDT", "Atlantis Blue", null, KnownAccounts.AtlantisBlue),
    "BTC-Interstellar" : new Asset("BTC", "Bitcoin", null, KnownAccounts.Interstellar),
    "BTC-NaoBTC" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.NaoBTC),
    "BTC-Papaya" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Papaya2, 'https://apay.io/public/logo/btc.svg'),
    "CNY-RippleFox" : new Asset("CNY", "Chinese Yuan", "credit_alphanum4", KnownAccounts.RippleFox),
    "ETH-fchain" : new Asset("ETH", "Ethereum", null, new Account("GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIO2QZQ7IOZ4YC5XV3C2IKYU", "fchain.io")),
    "ETH-Papaya" : new Asset("ETH", "Ethereum", "credit_alphanum4", KnownAccounts.Papaya1, 'https://apay.io/public/logo/eth.png'),
    "EURT" : new Asset("EURT", "Euro", "credit_alphanum4", KnownAccounts.Tempo),
    "GTN" : new Asset("GTN", "Glitzkoin", null, new Account("GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46", "Glitzkoin.com")),
    "GRAT" : new Asset("GRAT", "Gratz token", null, new Account("GAJ7V3EMD3FRWAPBEJAP7EC4223XI5EACDZ46RFMY5DYOMCIMWEFR5II", "gratz.io")),
    "MOBI" : new Asset("MOBI", "Mobius", "credit_alphanum4", KnownAccounts.Mobius, 'https://mobius.network/mobi.png'),
    "REPO" : new Asset("REPO", "RepoCoin", "credit_alphanum4", KnownAccounts.RepoCoin),
    "RMT" : new Asset("RMT", "SureRemit token", "credit_alphanum4", KnownAccounts.SureRemit),
    "SLT" : new Asset("SLT", "Smartlands token", "credit_alphanum4", KnownAccounts.SmartLands, 'https://smartlands.io/.well-known/KPUeW1N1.jpg'),
    "TERN" : new Asset("TERN", "Ternio.io TERN", "credit_alphanum4", KnownAccounts.Ternio),
    "USD-AnchorUsd": new Asset("USD", "US dollar", null, new Account("GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX", "anchorusd.com")),
    "XCN" : new Asset("XCN", "Chinese Yuan", "credit_alphanum4", KnownAccounts.Firefly),
    "XRP-Interstellar" : new Asset("XRP", "XRP", null, KnownAccounts.Interstellar)
};
