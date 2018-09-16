import { Component, OnInit } from '@angular/core';

import { ExchangePair } from "../model/exchange-pair.model";
import { KnownAssets } from '../model/asset.model';

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
    new ExchangePair("highVolume03", KnownAssets.XCN, KnownAssets.HKDT)
  ];

  constructor() { }

  ngOnInit() {
    //TODO: get the stats from server and assign this.exchangeList by it
  }

}
