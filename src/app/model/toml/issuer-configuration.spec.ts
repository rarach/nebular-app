import { IssuerConfiguration } from "./issuer-configuration";


describe('IssuerConfiguration', () => {
    it("should parse currencies from source data #1", () => {
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

    it("should parse currencies from source data #2", () => {
        const tomlData = `# ----- Hope Coin Issuer <hopecoin.org> -----

ACCOUNTS=["GBAOB4O4LUZYTPAG64PZQ7CVLV3PJWQA7B6D5VBCQM42W74HN5DDHKMO", "GCBPAV743BDUT5R3LHYOL6OSW3WRS4HKV27NMQ33ATQC6OSVZ5AABHCU", "GBUO5QHPC6HAWBW7SLCQLSED2SNH6KUWC5A4WQKF5QPVXCVI3TF4XFYY", "GDMADR66BLZDYNRT77JSTAMYXKR2VLTQZEVRXMR6QUMBT6PC4DRIN5P2", "GCU6JBLHU6AIJ7LDOHKMUWKMPX3MZTFY5SN4ZTCOAQCWV4OZADHLCM5X", "GDWHWNAYZWZWJLYCD2V2OFTWJLNIE7ICZVVGGMIH4Z7N5IWTLWMNFKK6"]

[DOCUMENTATION]
ORG_NAME="Hope Coin Org"
ORG_URL="https://hopecoin.org"
ORG_LOGO="https://hopecoin.org/hopecoin-logo.png"
ORG_OFFICIAL_EMAIL="hope@hopecoin.org"
ORG_TWITTER="hopecoin_org"
ORG_DESCRIPTION="Hope Coin Org is the organization behind Hope Coin. We are an independent team dedicated to spreading more Hope around the world."

[[PRINCIPALS]]
name="Mark"
email="mark@hopecoin.org"

[[CURRENCIES]]
code="HOPE"
issuer="GBAOB4O4LUZYTPAG64PZQ7CVLV3PJWQA7B6D5VBCQM42W74HN5DDHKMO"
status="live"
is_asset_anchored=false
display_decimals=2
name="Hope Coin"
fixed_number=7600000000
desc="Hope Coin is a digital token that gives you and lets you share Hope."
image="https://hopecoin.org/hopecoin-icon.png"

# ----- To live without hope is to cease to live! -----`;
        const issuerConfig = new IssuerConfiguration(tomlData);

        expect(issuerConfig.currencies.length).toBe(1);
        expect(issuerConfig.currencies[0].code).toBe("HOPE");
        expect(issuerConfig.currencies[0].desc).toBe("Hope Coin is a digital token that gives you and lets you share Hope.");
        expect(issuerConfig.currencies[0].name).toBe("Hope Coin");
        expect(issuerConfig.currencies[0].issuer).toBe("GBAOB4O4LUZYTPAG64PZQ7CVLV3PJWQA7B6D5VBCQM42W74HN5DDHKMO");
        expect(issuerConfig.currencies[0].image).toBe("https://hopecoin.org/hopecoin-icon.png");
        expect(issuerConfig.currencies[0].display_decimals).toBe(2);
    });

    it("should parse currencies from source data #3", () => {
        const tomlData = `# Sample stellar.toml

#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://stellarid.io/federation/"

# asset with meta info
[[CURRENCIES]]
code="ETX"
issuer="GCEFMSNWXTALXQPRQFIXOMWJHZFDEQJBM26RGEDZUDFMU32JB6WJGRJX"
display_decimals=2
name="Ethereum X"
desc="Bringing Ethereum to the XLM blockchain"
conditions="100 million coins"
image="https://etxco.com/etx.png"

# optional extra information for humans
# Useful place for anchors to detail various policies and required info

###################################
# Required compliance fields:
#      name=<recipient name>
#      addr=<recipient address>
# Federation Format:
#        <phone number>*anchor.com
#        Forwarding supported by sending to: forward*anchor.com
#           forward_type=bank_account
#           swift=<swift code of receiving bank>
#           acct=<recipient account number at receiving bank>
# Minimum Amount Forward: $2 USD
# Maximum Amount Forward: $10000 USD`;
        const issuerConfig = new IssuerConfiguration(tomlData);

        expect(issuerConfig.currencies.length).toBe(1);
        expect(issuerConfig.currencies[0].code).toBe("ETX");
        expect(issuerConfig.currencies[0].desc).toBe("Bringing Ethereum to the XLM blockchain");
        expect(issuerConfig.currencies[0].name).toBe("Ethereum X");
        expect(issuerConfig.currencies[0].issuer).toBe("GCEFMSNWXTALXQPRQFIXOMWJHZFDEQJBM26RGEDZUDFMU32JB6WJGRJX");
        expect(issuerConfig.currencies[0].image).toBe("https://etxco.com/etx.png");
        expect(issuerConfig.currencies[0].display_decimals).toBe(2);
    });

    it("should parse currencies from source data #4", () => {
        const tomlData = `# ----- Stronghold's Public Stellar Anchor <stronghold.co> -----

ACCOUNTS=[
"GBSTRUSD7IRX73RQZBL3RQUH6KS3O4NYFY3QCALDLZD77XMZOPWAVTUK",
"GCSTRNZDFRJEHYI3JIVZEO4DHXI2HBRRSZG7OVRT4BAM2SYHBGNGL5T2",
"GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH",
"GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG",
"GBSTRXRPA7ALGIXDYBHQ6WYWY2NAHLSF64Q3W5DKAPZNMRHKQL6FYXUA",
"GCSTRLTC73UVXIYPHYTTQUUSDTQU2KQW5VKCE4YCMEHWF44JKDMQAL23"]

[DOCUMENTATION]
ORG_NAME="Stronghold Anchor Limited"
ORG_DBA="Stronghold"
ORG_URL="https://stronghold.co/shx"
ORG_LOGO="https://stronghold.co/img/Stronghold-Logo-100x100.png"
ORG_OFFICIAL_EMAIL="happiness@stronghold.co"

[[CURRENCIES]]
code="SHX"
issuer="GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH"
display_decimals=0
name="Stronghold Token"
desc="The Stronghold token."
image="https://stronghold.co/img/Stronghold-Logo-100x100.png"

[[CURRENCIES]]
code="USD"
issuer="GBSTRUSD7IRX73RQZBL3RQUH6KS3O4NYFY3QCALDLZD77XMZOPWAVTUK"
display_decimals=2
anchor_asset_type="fiat"
name="Retired - Redeem Immeadiately (USD)"
desc="This asset has been retired. Please redeem this asset immeadiately."
redemption_instructions="Sell this asset on the Stellar DEX or withdraw it via https://trade.stronghold.co. See https://medium.com/strongholdxchg/stronghold-creates-proprietary-order-book-for-business-customers-6c5ff02af050 for more information."
image="https://stronghold.co/img/Stronghold-Logo-100x100.png"

[[CURRENCIES]]
code="BTC"
issuer="GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG"
display_decimals=7
anchor_asset="BTC"
name="Retired - Redeem Immeadiately (BTC)"
desc="This asset has been retired. Please redeem this asset immeadiately."
redemption_instructions="Sell this asset on the Stellar DEX or withdraw it via https://trade.stronghold.co."
image="https://stronghold.co/img/Stronghold-Logo-100x100.png"

[[CURRENCIES]]
code="ETH"
issuer="GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG"
display_decimals=7
name="Retired - Redeem Immeadiately (ETH)"
desc="This asset has been retired. Please redeem this asset immeadiately."
redemption_instructions="Sell this asset on the Stellar DEX or withdraw it via https://trade.stronghold.co. See https://medium.com/strongholdxchg/stronghold-creates-proprietary-order-book-for-business-customers-6c5ff02af050 for more information."
image="https://stronghold.co/img/Stronghold-Logo-100x100.png"

[[CURRENCIES]]
code="XRP"
issuer="GBSTRXRPA7ALGIXDYBHQ6WYWY2NAHLSF64Q3W5DKAPZNMRHKQL6FYXUA"
display_decimals=7
anchor_asset="XRP"
name="Retired - Redeem Immeadiately (XRP)"
desc="This asset has been retired. Please redeem this asset immeadiately."
redemption_instructions="Sell this asset on the Stellar DEX or withdraw it via https://trade.stronghold.co. See https://medium.com/strongholdxchg/stronghold-creates-proprietary-order-book-for-business-customers-6c5ff02af050 for more information."
image="https://stronghold.co/img/Stronghold-Logo-100x100.png"

[[CURRENCIES]]
code="LTC"
issuer="GCSTRLTC73UVXIYPHYTTQUUSDTQU2KQW5VKCE4YCMEHWF44JKDMQAL23"
display_decimals=7
anchor_asset="LTC"
name="Retired - Redeem Immeadiately (LTC)"
desc="This asset has been retired. Please redeem this asset immeadiately."
redemption_instructions="Sell this asset on the Stellar DEX or withdraw it via https://trade.stronghold.co. See https://medium.com/strongholdxchg/stronghold-creates-proprietary-order-book-for-business-customers-6c5ff02af050 for more information."
image="https://stronghold.co/img/Stronghold-Logo-100x100.png"`;
        const issuerConfig = new IssuerConfiguration(tomlData);

        expect(issuerConfig.currencies.length).toBe(6);
        expect(issuerConfig.currencies[0].code).toBe("SHX");
        expect(issuerConfig.currencies[0].name).toBe("Stronghold Token");
        expect(issuerConfig.currencies[0].issuer).toBe("GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH");
        expect(issuerConfig.currencies[0].image).toBe("https://stronghold.co/img/Stronghold-Logo-100x100.png");
        expect(issuerConfig.currencies[0].display_decimals).toBe(0);
    });
    
    it("should parse currencies from source data #5", () => {
        const tomlData = `[[CURRENCIES]]
        code="DICENS"
        issuer="GDNCVZVHMIZNXA3O6XNES42PHVAFKYO4XC2N7EQOJ54GR5VJPYJJEKFU"
        status="live"
        display_decimals=7
        name="Dicens.co"
        fixed_number=27000000
        desc="Dicens is a publishing platform where content creators can monetize their works . You can start today to monetize your stories."
        image="http://2.gravatar.com/avatar/079f925476dd929b7e2eb4ab0b9cb936"
        
        [DOCUMENTATION]
        ORG_NAME="Dicens"
        ORG_URL="https://www.dicens.co/"
        ORG_LOGO="http://2.gravatar.com/avatar/079f925476dd929b7e2eb4ab0b9cb936"
        ORG_DESCRIPTION="You can start today to monetize your stories."
        ORG_OFFICIAL_EMAIL="sathosi@dicens.co"
        ORG_TWITTER="Dicens7"`;
        const issuerConfig = new IssuerConfiguration(tomlData);

        expect(issuerConfig.currencies.length).toBe(1);
        expect(issuerConfig.currencies[0].code).toBe("DICENS");
        expect(issuerConfig.currencies[0].image).toBe("http://2.gravatar.com/avatar/079f925476dd929b7e2eb4ab0b9cb936");
        expect(issuerConfig.currencies[0].display_decimals).toBe(7);
    });
});
