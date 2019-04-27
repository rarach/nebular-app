import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { Observable } from 'rxjs';
import { IssuerConfiguration } from '../model/toml/issuer-configuration';


@Injectable({
    providedIn: 'root'
})
export class TomlConfigService {
    constructor(private tomlFileUrl: string, private http: HttpClient) { }

    public getIssuerConfig() : Observable<IssuerConfiguration> {
        const obser = this.http.get(this.tomlFileUrl, {responseType: 'text'})
                               .pipe(map(data => new IssuerConfiguration(data)));
        return obser;
    }
}
