import { Observable, of, throwError } from "rxjs";
import { IssuerConfiguration } from "../model/toml/issuer-configuration";

export class TitleStub {
    title: string|null = null;
    setTitle(value: string): void { this.title = value; }
}

export class TomlConfigServiceStub {
    constructor(public tomlData: string) { }

    public getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
        if ("THROW_ERROR" === tomlFileUrl) {
            return throwError(() => new Error("Sorry, stellar.toml file is unreachable"));
        }

        const config = new IssuerConfiguration(this.tomlData);
        return of(config);
    }
} 
