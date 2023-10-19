import { Account, KnownAccounts } from "./account.model";
import { Constants } from "./constants";

export class Asset {
    constructor(public readonly code: string|null,
                public fullName: string,
                public readonly type: string|null,
                public readonly issuer: Account|null,
                public imageUrl: string|null = null) {
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
}


/** "Database" of currently knwon assets on the Stellar network. TODO: load this from backend! */
export const KnownAssets = {
    "XLM" : new Asset("XLM", "Lumen", "native", new Account(null, null), Constants.NATIVE_ASSET_IMAGE),
    "BTC-Interstellar" : new Asset("BTC", "Bitcoin", null, KnownAccounts.Interstellar),
    "CNY-RippleFox" : new Asset("CNY", "Chinese Yuan", "credit_alphanum4", KnownAccounts.RippleFox),
    "ETH-fchain" : new Asset("ETH", "Ethereum", null, new Account("GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIO2QZQ7IOZ4YC5XV3C2IKYU", "fchain.io")),
    "EURT" : new Asset("EURT", "Euro", "credit_alphanum4", KnownAccounts.Tempo),
    "MOBI" : new Asset("MOBI", "Mobius", "credit_alphanum4", KnownAccounts.Mobius, 'https://mobius.network/mobi.png'),
    "SLT" : new Asset("SLT", "Smartlands token", "credit_alphanum4", KnownAccounts.SmartLands, 'https://smartlands.io/.well-known/KPUeW1N1.jpg'),
    "TERN" : new Asset("TERN", "Ternio.io TERN", "credit_alphanum4", KnownAccounts.Ternio),
    "USD-AnchorUsd": new Asset("USD", "US dollar", null, new Account("GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX", "anchorusd.com")),
    "XCN" : new Asset("XCN", "Chinese Yuan", "credit_alphanum4", KnownAccounts.Firefly),
    "XRP-Interstellar" : new Asset("XRP", "XRP", null, KnownAccounts.Interstellar)
};
