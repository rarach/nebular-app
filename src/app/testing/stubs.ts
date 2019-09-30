import { Observable, of, throwError } from "rxjs";
import { IssuerConfiguration } from "../model/toml/issuer-configuration";


export class TitleStub {
    title: string = null;
    setTitle(value: string) { this.title = value; }
}

export class TomlConfigServiceStub {
    constructor(public tomlData: string) { }

    public getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
        if ("THROW_ERROR" === tomlFileUrl) {
            return throwError("Sorry, stellar.toml file is unreachable");
        }

        const config = new IssuerConfiguration(this.tomlData);
        return of(config);
    }
} 
