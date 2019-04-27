import { TomlAsset } from "./toml-asset";

/** Configuration of issuer's server, normally comming from their domain.com/.well-known/stellar.toml */
export class IssuerConfiguration {
    public currencies: TomlAsset[];

    constructor(tomlData: string) {
        this.currencies = this.parseCurrencies(tomlData);
    }

    private parseCurrencies(tomlData: string): TomlAsset[] {
        const currencies = new Array<TomlAsset>();
        const lines = tomlData.split('\n');
        for (let i=0; i < lines.length; i++) {
            if (lines[i].startsWith("[[CURRENCIES]]")) {
                const currency = this.parseCurrency(lines, i);
                if (currency) {
                    currencies.push(currency);
                }
            }
        }

        return currencies;
    }

    private parseCurrency(tomlLines: string[], startLine: number): TomlAsset {
        let code: string = null;
        let name: string = null;
        let desc: string = null;
        let issuer: string = null;
        let decimals: number = null;

        for(let i = startLine+1; ; i++) {
            if (!tomlLines[i] || tomlLines[i].startsWith('[')) {
                break;
            }
            const tokens = tomlLines[i].split('=');
            if (!tokens || !tokens.length || tokens[0] === "") {
                //Empty line or comment shouldn't be possible in correct stellar.toml but one never knows...
                continue;
            }
            const key: string = tokens[0].trimRight();
            const value: string = tokens[1].trimLeft().replace(new RegExp('"', "g"), '');
            switch(key) {
                case "code":
                    code = value;
                break;
                case "name":
                    name = value;
                break;
                case "desc":
                    desc = value;
                case "issuer":
                    issuer = value;
                break;
                case "display_decimals":
                    decimals = Number(value);
                break;
            }
        }

        if (code && issuer && decimals) {
            const asset = new TomlAsset(code, issuer, decimals);
            asset.name = name;
            asset.desc = desc;

            return asset;
        }
        return null;
    }
}
