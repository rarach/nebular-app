import { IssuerConfiguration } from "./issuer-configuration";


describe('IssuerConfiguration', () => {
    it("should parse currencies from source data", () => {
        const tomlData = `
# Federation service provided by StellarID.io
FEDERATION_SERVER="https://stellarid.io/federation/"
TRANSFER_SERVER="https://thewwallet.com/ExtApi"

# convenience mapping of common names to node IDs.
# You can use these common names in sections below instead of the less friendly nodeID.
# This is provided mainly to be compatible with the stellar-core.cfg
NODE_NAMES=[
"GCKWUQGSVO45ZV3QK7POYL7HMFWDKWJVMFVEGUJKCAEVUITUCTQWFSM6  ibm_au",
"GBUJA3Z5TLAKLI5MEH4TETLXJBQVSVW74MNEKP5UUHTP3IMLNSUPOTVA  ibm_br",
"GB2HF2NHRKKFZYFDGD7MUENOYROOEK7SWYV2APYOODP6P7BUJTLILKIL  ibm_ca",
"GDRA72H7JWXAXWJKOONQOPH3JKNSH5MQ6BO5K74C3X6FO2G3OG464BPU  ibm_no",
"GAEEH4TBR7YQQWKJ2FIT57HXZZTMK2BX5LY4POJUYFSEZ7Y2ONHPPTES  ibm_it",
"GBJ7T3BTLX2BP3T5Q4256PUF7JMDAB35LLO32QRDYE67TDDMN7H33GGE  ibm_hk",
"GCH3O5PTCZVR4G65W3B4XDKWI5V677HQB3QO7CW4YPVYDDFBE2GE7G6V  ibm_in",
"GAENPO2XRTTMAJXDWM3E3GAALNLG4HVMKJ4QF525TR25RI42YPEDULOW  ibm_uk",
"GARBCBH4YSHUJLYEPKEPMVYZIJ3ZSQR3QCJ245CWGY64X72JLN4A6RSG  ibm_us",
"GC5SXLNAM3C4NMGK2PXK4R34B5GNZ47FYQ24ZIBFDFOCU6D4KBN4POAE  satoshipay1",
"GBJQUIXUO4XSNPAUT6ODLZUJRV2NPXYASKUBY4G5MYP3M47PCVI55MNT  satoshipay2",
"GAK6Z5UVGUVSEK6PEOCAYJISTT5EJBB34PN3NOLEQG2SUKXRVV2F6HZY  satoshipay3",
"GCGB2S2KGYARPVIA37HYZXVRM2YZUEXA6S33ZU5BUDC6THSB62LZSTYH  sdf_watcher1",
"GCM6QMP3DLRPTAZW2UZPCPX2LF3SXWXKPMP3GKFZBDSF3QZGV2G5QSTK  sdf_watcher2",
"GABMKJM6I25XI4K7U6XWMULOUQIQ27BCTMLS6BYYSOWKTBUXVRJSXHYQ  sdf_watcher3"
]

#   A list of accounts that are controlled by this domain.
ACCOUNTS=[
"GBH42X7GG5TQLBMKY2KNYQ6KY7XOUALQCUUZQH5EOLVNULDJMLCNUNJP"
]

#   Any validation public keys that are declared
#   to be used by this domain for validating ledgers and are
#   authorized signers for the domain.
OUR_VALIDATORS=[
"GBH42X7GG5TQLBMKY2KNYQ6KY7XOUALQCUUZQH5EOLVNULDJMLCNUNJP"
]

#   List of Hosts/IPs of known stellar-core's.
#   These are host:port strings.
#   Port is optional.
#   By convention, IPs/Hosts are listed from most to least trusted, if that information is known.
KNOWN_PEERS=[
"au.stellar.ibm.com",
"br.stellar.ibm.com",
"ca.stellar.ibm.com",
"no.stellar.ibm.com",
"it.stellar.ibm.com",
"hk.stellar.ibm.com",
"in.stellar.ibm.com",
"uk.stellar.ibm.com",
"us.stellar.ibm.com",
"stellar1.satoshipay.io",
"stellar2.satoshipay.io",
"stellar3.satoshipay.io",
"core-live-a.stellar.org",
"core-live-b.stellar.org",
"core-live-c.stellar.org"
]

[QUORUM_SET]
VALIDATORS=[
"$satoshipay1", "$satoshipay2", "$satoshipay3"
]

[[CURRENCIES]]
code = "WSD"
conditions = "WSD Tokens are issued when $ USD deposits are made and burned when $USD deposits are redeemed"
desc = "The White Standard is a stable coin 100% backed by and redeemable for $USD"
display_decimals = 2
image = "https://www.thewwallet.com/logo"
issuer = "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V"
name = "White Standard Dollar"
anchor_asset_type="fiat"
anchor_asset="USD"
is_asset_anchored = "true"
redemption_instructions = "Redeemable through https://thewwallet.com or through SEP-006 via thewwallet.com API"
[[CURRENCIES]]
code = "WSEUR"
conditions = "WSE Tokens are issued when � EURO deposits are made and burned when EURO deposits are redeemed"
desc = "The White Standard Euro is a stable coin 100% backed by and redeemable for EURO"
display_decimals = 2
image = "https://www.thewwallet.com/logowse"
issuer = "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V"
name = "White Standard Euro"
anchor_asset_type="fiat"
anchor_asset="EUR"
is_asset_anchored = "true"
redemption_instructions = "Redeemable through https://thewwallet.com or through SEP-006 via thewwallet.com API"
[[CURRENCIES]]
code = "WSGBP"
conditions = "WSP Tokens are issued when � GBP deposits are made and burned when GBP deposits are redeemed"
desc = "The White Standard Pound is a stable coin 100% backed by and redeemable for GBP"
display_decimals = 2
image = "https://www.thewwallet.com/logowsp"
issuer = "GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V"
name = "White Standard Pound"
anchor_asset_type="fiat"
anchor_asset="GBP"
is_asset_anchored = "true"
redemption_instructions = "Redeemable through https://thewwallet.com or through SEP-006 via thewwallet.com API"
[[CURRENCIES]]
code = "BSV"
conditions = "BSV Tokens are issued when BSV deposits are made and burned when BSV deposits are redeemed"
desc = "The BSV anchor is 100% backed by and redeemable for Bitcoin SV"
display_decimals = 5
image = "https://www.thewwallet.com/logobsv"
issuer = "GASDFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
name = "Bitcoin SV"
anchor_asset_type="crypto"
anchor_asset="BSV"
is_asset_anchored = "true"
redemption_instructions = "Redeemable through https://thewwallet.com or through SEP-006 via thewwallet.com API"

[[CURRENCIES]]
code = "FAIL"
desc= "This is incomplete currency definition. Should not pass parsing"
name ="Simply nope"

`;
        const issuerConfig = new IssuerConfiguration(tomlData);

        expect(issuerConfig.currencies.length).toBe(4);
        expect(issuerConfig.currencies[0].code).toBe("WSD");
        expect(issuerConfig.currencies[1].code).toBe("WSEUR");
        expect(issuerConfig.currencies[2].code).toBe("WSGBP");
        expect(issuerConfig.currencies[3].code).toBe("BSV");
        expect(issuerConfig.currencies[0].desc).toBe("The White Standard is a stable coin 100% backed by and redeemable for $USD");
        expect(issuerConfig.currencies[1].name).toBe("White Standard Euro");
        expect(issuerConfig.currencies[2].issuer).toBe("GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V");
        expect(issuerConfig.currencies[3].display_decimals).toBe(5);
    });
});
