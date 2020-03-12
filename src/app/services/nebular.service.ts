import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { OverviewData } from '../model/overview-data.model';


@Injectable({
    providedIn: 'root'
})
export class NebularService {
    private readonly API_URL = "https://nebularapi.azurewebsites.net/api";

    constructor(private http: HttpClient) { }


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
}
