import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CookieService, CookieOptions } from 'ngx-cookie';

import { OverviewData } from '../model/overview-data.model';


@Injectable({
    providedIn: 'root'
})
export class NebularService {
    private readonly COOKIE_NAME = "agr";
    private readonly API_URL = "https://nebularapi.azurewebsites.net/api";

    constructor(private readonly http: HttpClient,
                private readonly cookieService: CookieService) {
                }


    /**
     * Retrieve list of exchanges with highest trade volume in past 24 hours.
     */
    getTopVolumeExchanges() : Observable<OverviewData> {
        const url = this.API_URL + "/topExchanges";

        return this.http.get<string>(url).pipe(map<any, OverviewData>(data => {
            if (typeof(data) == "string") {
                data = JSON.parse(data);
            }
            return data;
        }));
    }

    UserAgreedWithCookies(): boolean {
        const cookieText = this.cookieService.get(this.COOKIE_NAME);

        return "true" === cookieText;
    }

    /**
     * The user agreed with using cookies. Save this info to... a cookie.
     */
    SetUserAgreement() {
        //Make it expire in 200 days
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 200);
        const options: CookieOptions = {
            expires: expiration
        };

        this.cookieService.put(this.COOKIE_NAME, "true", options);
    }
}
