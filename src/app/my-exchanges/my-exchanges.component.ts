import { Component } from '@angular/core';
import { Title } from "@angular/platform-browser";

import { AssetService } from '../asset.service';
import { ExchangePair } from '../model/exchange-pair.model';


@Component({
    selector: 'app-my-exchanges',
    templateUrl: './my-exchanges.component.html',
    styleUrls: ['./my-exchanges.component.css']
})
export class MyExchangesComponent {
    exchanges = new Array<ExchangePair>();

    constructor(titleService: Title, private assetService: AssetService) {
        titleService.setTitle("My Exchanges");
        this.exchanges = this.assetService.customExchanges;
    }


    addCustomExchange() {
        const newExchange: ExchangePair = this.assetService.CreateCustomExchange();
    }
}
