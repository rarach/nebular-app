export class Account {
    constructor(public readonly address: string, public domain: string = null){
        if ((domain || "").length <= 0 && null != address) {
            this.domain = address.substring(0, 16) + "...";
        }
    }

    /** True for dummy issuer of XLM */
    IsNativeIssuer() : boolean {
        return null === this.address;
    }
}


//TODO: delete this even if KnownAssets should still be hard-coded
export const KnownAccounts = {
    "Firefly" : new Account("GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY", "fchain.io"),
    "Interstellar" : new Account("GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P", "interstellar.exchange"),
    "Mobius" : new Account("GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH", "mobius.network"),
    "RippleFox" : new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "ripplefox.com"),
    "SmartLands": new Account("GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP", "smartlands.io"),
    "Stronghold" : new Account("GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH", "stronghold.co"),
    "Tempo" : new Account("GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S", "tempo.eu.com"),
    "Ternio" : new Account("GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C", "ternio.io")
};
