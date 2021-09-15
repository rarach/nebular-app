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
    "AtlantisBlue" : new Account("GDZURZR6RZKIQVOWZFWPVAUBMLLBQGXP2K5E5G7PEOV75IYPDFA36WK4", "atlantisblue.org"),
    "Firefly" : new Account("GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY", "fchain.io"),
    "Interstellar" : new Account("GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P", "interstellar.exchange"),
    "Mobius" : new Account("GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH", "mobius.network"),
    "NaoBTC" : new Account("GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH", "naobtc.com"),
    "Papaya1" : new Account("GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR", "apay.io"),   //Does ERC-20 tokens
    "Papaya2" : new Account("GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF", "apay.io"),   //Does only BTC
    "RippleFox" : new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "ripplefox.com"),
    "RepoCoin" : new Account("GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B", "repocoin.io"),
    "SmartLands": new Account("GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP", "smartlands.io"),
    "Stronghold" : new Account("GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH", "stronghold.co"),
    "SureRemit" : new Account("GDEGOXPCHXWFYY234D2YZSPEJ24BX42ESJNVHY5H7TWWQSYRN5ZKZE3N", "sureremit.co"),
    "Tempo" : new Account("GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S", "tempo.eu.com"),
    "Ternio" : new Account("GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C", "ternio.io")
};
