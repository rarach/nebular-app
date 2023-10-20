import { TomlAsset } from "./toml-asset";

/** Configuration of issuer's server, normally comming from their domain.com/.well-known/stellar.toml */
export class IssuerConfiguration {
  public readonly currencies: TomlAsset[];

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
    let image: string = null;

    for(let i = startLine+1; ; i++) {
      if (!tomlLines[i] || tomlLines[i].startsWith('[') || tomlLines[i].indexOf("=") <= 0) {
        break;
      }
      const eqIndex = tomlLines[i].indexOf("=");

      const key: string = tomlLines[i].substring(0, eqIndex).trim();
      const value: string = tomlLines[i].substring(eqIndex+1).trim().replace(new RegExp('"', "g"), '');
      switch(key) {
      case "code":
        code = value;
        break;
      case "name":
        name = value;
        break;
      case "desc":
        desc = value;
        break;
      case "issuer":
        issuer = value;
        break;
      case "image":
        image = value;
        break;
      }
    }

    if (code && issuer) {
      const asset = new TomlAsset(code, issuer);
      asset.name = name;
      asset.desc = desc;
      asset.image = image;

      return asset;
    }
    return null;
  }
}
