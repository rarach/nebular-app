import { Component, Input } from '@angular/core';
import { ExchangePair } from '../model/exchange-pair.model';
import { ExecutedTrade } from '../model/executed-trade.model';
import { Utils } from '../utils';


@Component({
  selector: 'app-trade-history',
  templateUrl: './trade-history.component.html',
  styleUrls: ['./trade-history.component.css']
})
export class TradeHistoryComponent {
  @Input() readonly exchange: ExchangePair;
  @Input() readonly recentTrades: ExecutedTrade[];
  Utils = Utils;  //template accessibility


  constructor(){}
}