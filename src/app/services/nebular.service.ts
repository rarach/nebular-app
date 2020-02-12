import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Asset } from '../model/asset.model';


@Injectable({
    providedIn: 'root'
})
export class NebularService {
    private readonly API_URL = "https://bots2017.cloudapp.net/api";

    constructor(private http: HttpClient) { }


    /**
     * Retrieve list of exchanges with highest trade volume in past 24 hours.
     */
    getTopVolumeExchanges() : Observable<ILightExchangePair[]> {
        const url = this.API_URL + "/top_exchanges.json";

        return this.http.get<string>(url).pipe(map<any, ILightExchangePair[]>(data => {
            if (typeof(data) == "string") {
                data = JSON.parse(data);
            }
            return data;
        }));
    }
}

export interface ILightExchangePair {       //TODO: move to appropriate place
    baseAsset: Asset;
    counterAsset: Asset;
}