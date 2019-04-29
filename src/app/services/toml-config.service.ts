import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { Observable } from 'rxjs';
import { IssuerConfiguration } from '../model/toml/issuer-configuration';


@Injectable({
    providedIn: 'root'
})
export class TomlConfigService {
    constructor(private http: HttpClient) { }

    public getIssuerConfig(tomlFileUrl: string) : Observable<IssuerConfiguration> {
        const obser = this.http.get(tomlFileUrl, {responseType: 'text'})
                               .pipe(map(data => new IssuerConfiguration(data)));
        return obser;
    }
}
