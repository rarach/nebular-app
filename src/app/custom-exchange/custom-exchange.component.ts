import { Component, OnInit, Input } from '@angular/core';
import { ExchangePair } from '../model/exchange-pair.model';


@Component({
    selector: 'app-custom-exchange',
    templateUrl: './custom-exchange.component.html',
    styleUrls: ['./custom-exchange.component.css']
})
export class CustomExchangeComponent implements OnInit {
/*
    private readonly _baseAssetCodeDropDownId = "baseAssetCodeDropDown" + this.exchange.id;
    private readonly _baseAnchorDropDownId = "baseAssetAnchorDropDown" + this.exchange.id;
    private readonly _counterAssetCodeDropDownId = "counterAssetCodeDropDown" + this.exchange.id;
    private readonly _counterAnchorDropDownId = "counterAssetAnchorDropDown" + this.exchange.id;
*/

    @Input() exchange: ExchangePair;

    constructor() { }

    ngOnInit() {
    }

}
