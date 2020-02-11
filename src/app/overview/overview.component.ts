import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Asset } from '../model/asset.model';
import { ExchangePair } from "../model/exchange-pair.model";
import { NebularService } from '../services/nebular.service';


@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
    exchangeList: ExchangePair[] = null;

    constructor(private readonly nebularService: NebularService, titleService: Title) {
        titleService.setTitle("Nebular");
    }

    ngOnInit() {
        this.nebularService.getTopVolumeExchanges().subscribe(data => {
            this.exchangeList = [];
            let i = 0;

            for (let exchange of data) {
                const baseAsset = new Asset(exchange.baseAsset.code, null, null, exchange.baseAsset.issuer, null);
                const counterAsset = new Asset(exchange.counterAsset.code, null, null, exchange.counterAsset.issuer, null);
                const pair = new ExchangePair("front_exch_" + (i++), baseAsset, counterAsset);
                this.exchangeList.push(pair);
            }
        });
    }
}
