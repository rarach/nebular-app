import { Component, OnInit } from '@angular/core';

import { ExchangePair } from "../model/exchange-pair.model";
import { KnownAssets, Asset } from '../model/asset.model';
import { Title } from '@angular/platform-browser';


@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
    exchangeList: ExchangePair[] = [
        //Dummies for now
        new ExchangePair("highVolume01", KnownAssets.XLM, KnownAssets.MOBI),
        new ExchangePair("highVolume02", KnownAssets.XLM, KnownAssets["CNY-RippleFox"]),
        new ExchangePair("featured", KnownAssets.XLM, KnownAssets.HKDT),
        new ExchangePair("highVolume03", KnownAssets.XLM, KnownAssets.CMA),
        new ExchangePair("highVolume04", KnownAssets.XLM, KnownAssets.REPO),
        new ExchangePair("highVolume05", KnownAssets.XLM, KnownAssets.XCN),
        new ExchangePair("highTradeCount01", KnownAssets.XLM, KnownAssets.EURT),
        new ExchangePair("highTradeCount02", KnownAssets.XLM, KnownAssets["BTC-NaoBTC"]),
        new ExchangePair("highTradeCount03", KnownAssets.XLM, KnownAssets.ABDT),
        new ExchangePair("letsSee1", KnownAssets.XLM, KnownAssets.SLT),
        new ExchangePair("letsSee2", KnownAssets.XLM, KnownAssets["USD-Stonghold"]),
        new ExchangePair("letsSee1", KnownAssets.XLM, KnownAssets.WSD)
    ];

    constructor(titleService: Title) {
        titleService.setTitle("Nebular");
    }

    ngOnInit() {
        //TODO: get the stats from server and assign this.exchangeList by it
    }
}
