export class Account {
    constructor(public readonly address: string, public readonly shortName: string, public readonly domain: string){
        if ((shortName || "").length <= 0 && null != address) {
            this.shortName = address.substring(0, 16) + "...";
        }
        if ((domain || "").length <= 0) {
            this.domain = this.shortName;
        }
    }

    /** True for dummy issuer of XLM */
    IsNativeIssuer() : boolean {
        return null === this.address;
    }
}



export const KnownAccounts = {
    "Anclax" : new Account("GAEDLNMCQZOSLY7Y4NW3DTEWQEVVCXYYMBDNGPPGBMQH4GFYECBI7YVK", "Anclax", "anclax.com"),
    "Astral9" : new Account("GAUWES2POH347NNJGRI4OBM34LMOCMWSTZ3RAOZMOBH4PFVBWFMHLNTC", "Astral9", "astral9.io"),
    "AtlantisBlue" : new Account("GDZURZR6RZKIQVOWZFWPVAUBMLLBQGXP2K5E5G7PEOV75IYPDFA36WK4", "Atlantis Blue", "atlantisblue.org"),
    "CharnaToken" : new Account("GBRPTWEZTUKYM6VJXLHXBFI23M2GSY3TCVIQSZKFQLMOJXH7VPDGKBDP", "CharnaToken", "charnatoken.top"),
    "CoinsAsia" : new Account("GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP", "CoinsAsia", "coins.ph"),
    "Cowrie" : new Account("GAWODAROMJ33V5YDFY3NPYTHVYQG7MJXVJ2ND3AOGIHYRWINES6ACCPD", "Cowrie", "cowrie.exchange"),
    "CryptoMover10" : new Account("GDBCHKTHJUKDGSIQSTBUXFWVP3QVART5LED6KRZQ5X4Z5WLT4BGYXWCI", "CryptoMover", "cryptomover.com"),
    "CryptoMover3" : new Account("GDU2FEL6THGGOFDHHP4I5FHNWY4S2SXYUBCEDB5ZREMD6UFRT4SYWSW2", "CryptoMover", "cryptomover.com"),
    "CryptoMoverA" : new Account("GBWZHAVWY23QKKDJW7TXLSIHY5EX4NIB37O4NMRKN2SKNWOSE5TEPCY3", "CryptoMover", "cryptomover.com"),
    "CryptoMoverH" : new Account("GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ", "CryptoMover", "cryptomover.com"),
    "CryptoTari" : new Account("GD7UVDDJHJYKUXB4SJFIC6VJDQ4YADQCMRN3KLHJFV4H6NIUAEREVCO7", "CryptoTari", "cryptotari.io"),
    "eQuid" : new Account("GCGEQJR3E5BVMQYSNCHPO6NPP3KOT4VVZHIOLSRSNLE2GFY7EWVSLLTN", "eQuid", "equid.co"),
    "Firefly" : new Account("GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY", "Firefly", "fchain.io"),
    "Golix" : new Account("GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R", "Golix", "golix.io"),
    "IreneEnergy" : new Account("GBBRMEXJMS3L7Y3DZZ2AHBD545GZ72OAEHHEFKGZAHHASHGWMHK5P6PL", "Irene Energy", "irene.energy"),
    "Interstellar" : new Account("GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P", "Interstellar Exchange", "interstellar.exchange"),
    "Liquido" : new Account("GD2RRX6BKVTORZ6RIMBLWFVUOAYOLTS2QFJQUQPXLI3PBHR3TMLQNGZX", "Liquido", "liquido.i-server.org"),
    "Mobius" : new Account("GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH", "Mobius", "mobius.network"),
    "Moni" : new Account("GAKBPBDMW6CTRDCXNAPSVJZ6QAN3OBNRG6CWI27FGDQT2ZJJEMDRXPKK", "Moni", "moni.com"),
    "NaoBTC" : new Account("GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH", "NaoBTC", "naobtc.com"),
    "NaoXEL" : new Account("GAXELY4AOIRVONF7V25BUPDNKZYIVT6CWURG7R2I6NQU26IQSQODBVCS", "NaoBTC", "naobtc.com"),
    "Papaya1" : new Account("GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR", "Papaya", "apay.io"),   //Does ERC-20 tokens
    "Papaya2" : new Account("GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF", "Papaya", "apay.io"),   //Does only BTC
    "Papaya3" : new Account("GC5LOR3BK6KIOK7GKAUD5EGHQCMFOGHJTC7I3ELB66PTDFXORC2VM5LP", "Papaya", "apay.io"),   //Does only LTC
    "Papaya4" : new Account("GAEGOS7I6TYZSVHPSN76RSPIVL3SELATXZWLFO4DIAFYJF7MPAHFE7H4", "Papaya", "apay.io"),   //Does only BCH
    "RippleFox" : new Account("GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX", "RippleFox", "ripplefox.com"),
    "RepoCoin" : new Account("GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B", "RepoCoin", "repocoin.io"),
    "SixNetwork" : new Account("GDMS6EECOH6MBMCP3FYRYEVRBIV3TQGLOFQIPVAITBRJUMTI6V7A2X6Z", "Six Network", "six.network"),
    "SmartLands": new Account("GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP", "SmartLands", "smartlands.io"),
    "StemChain" : new Account("GAFXX2VJE2EGLLY3EFA2BQXJADAZTNR7NC7IJ6LFYPSCLE7AI3AK3B3M", "StemChain", "stemchain.io"),
    "Stronghold" : new Account("GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG", "Stronghold", "stronghold.co"),
    "StrongholdU" : new Account("GBSTRUSD7IRX73RQZBL3RQUH6KS3O4NYFY3QCALDLZD77XMZOPWAVTUK", "Stronghold", "stronghold.co"),
    "SureRemit" : new Account("GDEGOXPCHXWFYY234D2YZSPEJ24BX42ESJNVHY5H7TWWQSYRN5ZKZE3N", "SureRemit", "sureremit.co"),
    "TaiChiChain" : new Account("GDVJQHR5JZIGW76WBQREFMTYZ3JAKLSX2JTNT2P6DI4M7JR7VHUCNODY", "Tai Chi Chain", "taichichain.org"),
    "Tempo" : new Account("GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S", "Tempo", "tempo.eu.com"),
    "Ternio" : new Account("GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C", "Ternio", "ternio.io"),
    "VcBearBTC" : new Account("GDXTJEK4JZNSTNQAWA53RZNS2GIKTDRPEUWDXELFMKU52XNECNVDVXDI", "VCBear", "vcbear.net"),
    "VcBearJPY" : new Account("GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM", "VCBear", "vcbear.net"),
    "VcBearXRP" : new Account("GA7FCCMTTSUIC37PODEL6EOOSPDRILP6OQI5FWCWDDVDBLJV72W6RINZ", "VCBear", "vcbear.net"),
    "WhiteStandard": new Account("GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V", "White Standard", "thewwallert.com"),
    "XimCoin" : new Account("GBZ35ZJRIKJGYH5PBKLKOZ5L6EXCNTO7BKIL7DAVVDFQ2ODJEEHHJXIM", "XimCoin", "ximcoin.com"),
    "Xirkle" : new Account("GAO4DADCRAHA35GD6J3KUNOB5ELZE5D6CGPSJX2WBMEQV7R2M4PGKJL5", "Xirkle", "xirkle.com")
};
