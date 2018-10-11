import { Component, OnInit } from '@angular/core';

import { ExchangePair } from "../model/exchange-pair.model";
import { KnownAssets, Asset } from '../model/asset.model';
import { Account } from '../model/account.model';
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
        new ExchangePair("highVolume02", KnownAssets.XLM, KnownAssets["BTC-Stronghold"]),
        new ExchangePair("featured", KnownAssets.XLM, KnownAssets.REPO),
        new ExchangePair("highVolume03", KnownAssets.XCN, KnownAssets.HKDT),
        new ExchangePair("highVolume04", KnownAssets.XLM, KnownAssets.RMT),
        new ExchangePair("highVolume05", KnownAssets["CNY-RippleFox"], KnownAssets.XCN),
        new ExchangePair("highTradeCount01", KnownAssets.XLM, KnownAssets.EURT),
        new ExchangePair("highTradeCount02", KnownAssets.XLM, KnownAssets["USD-AnchorUsd"]),
        new ExchangePair("highTradeCount03", KnownAssets.XLM, KnownAssets.ABDT)
    ];

    constructor( private titleService: Title) { }

    ngOnInit() {
        this.titleService.setTitle("Nebular")
        //TODO: get the stats from server and assign this.exchangeList by it
    }
}
