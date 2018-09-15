import { Account, KnownAccounts } from "./account.model";
import { AssetService } from "../asset.service";
import { Constants } from "./constants";


export class Asset {
    constructor(public readonly code: string, public readonly fullName: string, public readonly type: string, public readonly issuer: Account) {
        this.code = code || Constants.NATIVE_ASSET_CODE;
        if (null === type ) {
            if (this.code === Constants.NATIVE_ASSET_CODE) {
                this.type = Constants.NATIVE_ASSET_TYPE;
            }
            else {
                this.type = code.length <= 4 ? "credit_alphanum4" : "credit_alphanum12";
            }
        }
    }

    /** @public Return true for Lumens (XLM) */
    IsNative(): boolean {
        return this.code === Constants.NATIVE_ASSET_CODE && this.type === Constants.NATIVE_ASSET_TYPE;
    };

    ToUrlParameters(prefix: string): string {
        let getParams = prefix + "_asset_code=" + this.code + "&" + prefix + "_asset_type=" + this.type;
        if (this.issuer) {
            getParams += "&" + prefix + "_asset_issuer=" + this.issuer.address;
        }

        return getParams;
    };

    ToExchangeUrlParameter(): string {
        return this.code + (this.type == Constants.NATIVE_ASSET_TYPE ? "" : "-" + this.issuer.address);
    };

    /**
     * Create new Asset instance from its string description
     * @param assetUrlParam asset definition, most likely gotten from URL, in form CODE-STELLAR_ADDRESS_OF_ISSUER
     * @param assetService instance of AssetService
     */
    static ParseFromUrlParam(assetUrlParam: string, assetService: AssetService) {
        const index = assetUrlParam.indexOf("-");
        let assetCode;
        let issuerAddress = null;
        let assetType = null;
        if (-1 === index) {
            assetCode = assetUrlParam;
            if (assetUrlParam != Constants.NATIVE_ASSET_CODE) {
                //Try to find issuers of that asset among known accounts
                issuerAddress = assetService.GetFirstIssuerAddress(assetUrlParam);
                if (!issuerAddress) {
                    throw new Error("Invalid URL parameters (missing issuer): " + assetUrlParam);
                }
            }
            else assetType = Constants.NATIVE_ASSET_TYPE;   //"native" for XLM
        }
        else {
            assetCode = assetUrlParam.substring(0, index);
            issuerAddress = assetUrlParam.substring(index + 1);
        }
    
        return new Asset(assetCode, null, assetType, new Account(issuerAddress, null, null));
    };
}


/** "Database" of currently knwon assets on the Stellar network. Subject to change anytime. */
export const KnownAssets = {
    "XLM" : new Asset("XLM", "Lumen", "native", new Account(null, "(native)", null)),
    "ABDT" : new Asset("ABDT", "Atlantis Blue", null, KnownAccounts.AtlantisBlue),
    "BAT" : new Asset("BAT", "Basic Attention Token", "credit_alphanum4", KnownAccounts.Papaya1),
    "BCH-Papaya" : new Asset("BCH", "Bitcoin Cash", "credit_alphanum4", KnownAccounts.Papaya4),
    "BTC-Golix" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Golix),
    "BTC-Interstellar" : new Asset("BTC", "Bitcoin", null, KnownAccounts.Interstellar),
    "BTC-Liquido" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Liquido),
    "BTC-NaoBTC" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.NaoBTC),
    "BTC-Papaya" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Papaya2),
    "BTC-Stronghold" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.Stronghold),
    "BTC-vcbear" : new Asset("BTC", "Bitcoin", "credit_alphanum4", KnownAccounts.VcBearBTC),
    "CHRC" : new Asset("CHRC", "Charna Token", "credit_alphanum4", KnownAccounts.CharnaToken),
    "CM3" : new Asset("CM3", "Crypto Mover Token 3", "credit_alphanum4", KnownAccounts.CryptoMover3),
    "CM10" : new Asset("CM10", "Crypto Mover Token 10", "credit_alphanum4", KnownAccounts.CryptoMover10),
    "CMA" : new Asset("CMA", "Crypto Mover Token A", "credit_alphanum4", KnownAccounts.CryptoMoverA),
    "CNY-RippleFox" : new Asset("CNY", "Chinese Yuan", "credit_alphanum4", KnownAccounts.RippleFox),
    "COP" : new Asset("COP", "Colombian Pesos", "credit_alphanum4", KnownAccounts.Anclax),
    "EQD" : new Asset("EQD", "eQuid", "credit_alphanum4", KnownAccounts.eQuid),
    "ETH-Liquido" : new Asset("ETH", "Ethereum", "credit_alphanum4", KnownAccounts.Liquido),
    "ETH-Papaya" : new Asset("ETH", "Ethereum", "credit_alphanum4", KnownAccounts.Papaya1),
    "ETH-Stronghold" : new Asset("ETH", "Ethereum", "credit_alphanum4", KnownAccounts.Stronghold),
    "EUR-Moni" : new Asset("EUR", "Euro", "credit_alphanum4", KnownAccounts.Moni),
    "EURT" : new Asset("EURT", "Euro", "credit_alphanum4", KnownAccounts.Tempo),
    "GTN" : new Asset("GTN", "Glitzkoin", null, new Account("GARFMAHQM4JDI55SK2FGEPLOZU7BTEODS3Y5QNT3VMQQIU3WV2HTBA46", "Glitzkoin.com", null)),
    "HKDT" : new Asset("HKDT", "Hong Kong Dollar", "credit_alphanum4", KnownAccounts.CryptoMoverH),
    "ICN" : new Asset("ICN", "Iconomi", "credit_alphanum4", KnownAccounts.Papaya1),
    "JPY" : new Asset("JPY", "Japanese Yen", "credit_alphanum4", KnownAccounts.VcBearJPY),
    "KIN-Papaya" : new Asset("KIN", "Kin token", "credit_alphanum4", KnownAccounts.Papaya1),
    "LINK" : new Asset("LINK", "ChainLink", "credit_alphanum4", KnownAccounts.Papaya1),
    "LTC-Interstellar" : new Asset("LTC", "Litecoin", null, KnownAccounts.Interstellar),
    "LTC-Liquido" : new Asset("LTC", "Litecoin", "credit_alphanum4", KnownAccounts.Liquido),
    "LTC-Papaya" : new Asset("LTC", "Litecoin", "credit_alphanum4", KnownAccounts.Papaya3),
    "MOBI" : new Asset("MOBI", "Mobius", "credit_alphanum4", KnownAccounts.Mobius),
    "MTL" : new Asset("MTL", "MetalPay token", "credit_alphanum4", KnownAccounts.Papaya1),
    "NGNT" : new Asset("NGNT", "Nigerian naira", "credit_alphanum4", KnownAccounts.Cowrie),
    "OMG" : new Asset("OMG", "OmiseGO", "credit_alphanum4", KnownAccounts.Papaya1),
    "PHP" : new Asset("PHP", "Philippine peso", "credit_alphanum4", KnownAccounts.CoinsAsia),
    "REP" : new Asset("REP", "Augur reputation token", "credit_alphanum4", KnownAccounts.Papaya1),
    "REPO" : new Asset("REPO", "RepoCoin", "credit_alphanum4", KnownAccounts.RepoCoin),
    "RMT" : new Asset("RMT", "SureRemit token", "credit_alphanum4", KnownAccounts.SureRemit),
    "SALT" : new Asset("SALT", "SALT", "credit_alphanum4", KnownAccounts.Papaya1),
    "SIX" : new Asset("SIX", "SIX token", "credit_alphanum4", KnownAccounts.SixNetwork),
    "SLT" : new Asset("SLT", "Smartlands token", "credit_alphanum4", KnownAccounts.SmartLands),
    "STEM" : new Asset("STEM", "STEMchain", "credit_alphanum4", KnownAccounts.StemChain),
    "TARI" : new Asset("TARI", "CryptoTARI", "credit_alphanum4", KnownAccounts.CryptoTari),
    "TELLUS" : new Asset("TELLUS", "Irene.energy TELLUS", "credit_alphanum12", KnownAccounts.IreneEnergy),
    "TERN" : new Asset("TERN", "Ternio.io TERN", "credit_alphanum4", KnownAccounts.Ternio),
    "USD-AnchorUsd": new Asset("USD", "US dollar", null, new Account("GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX", "anchorusd.com", null)),
    "USD-Golix" : new Asset("USD", "US dollar", "credit_alphanum4", KnownAccounts.Golix),
    "USD-Stonghold" : new Asset("USD", "US dollar", "credit_alphanum4", KnownAccounts.StrongholdU),
    "WSD" : new Asset("WSD", "US dollar", null, KnownAccounts.WhiteStandard),
    "WSE" : new Asset("WSE", "Euro", null, KnownAccounts.WhiteStandard),
    "XA9" : new Asset("XA9", "Astral", "credit_alphanum4", KnownAccounts.Astral9),
    "XCN" : new Asset("XCN", "Chinese Yuan", "credit_alphanum4", KnownAccounts.Firefly),
    "XEL" : new Asset("XEL", "NaoBTC XEL", "credit_alphanum4", KnownAccounts.NaoXEL),
    "XIM" : new Asset("XIM", "Ximcoin", "credit_alphanum4", KnownAccounts.XimCoin),
    "XIR" : new Asset("XIR", "Xirkle coin", "credit_alphanum4", KnownAccounts.Xirkle),
    "XLQ" : new Asset("XLQ", "Liquido", "credit_alphanum4", KnownAccounts.Liquido),
    "XRP-Interstellar" : new Asset("XRP", "XRP", null, KnownAccounts.Interstellar),
    "XRP-VCBear" : new Asset("XRP", "XRP", null, KnownAccounts.VcBearXRP),
    "XTC" : new Asset("XTC", "Tai Chi Chain", "credit_alphanum4", KnownAccounts.TaiChiChain),
    "ZRX" : new Asset("ZRX", "0x token", "credit_alphanum4", KnownAccounts.Papaya1)
};
