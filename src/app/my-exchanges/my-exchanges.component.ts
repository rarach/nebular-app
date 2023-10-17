import { Component } from '@angular/core';
import { Title } from "@angular/platform-browser";

import { AssetService } from '../services/asset.service';
import { ExchangePair } from '../model/exchange-pair.model';
import { NebularService } from '../services/nebular.service';
import { UiActionsService } from '../services/ui-actions.service';


@Component({
    selector: 'nebular-my-exchanges',
    templateUrl: './my-exchanges.component.html',
    styleUrls: ['./my-exchanges.component.css']
})
export class MyExchangesComponent {
    exchanges = new Array<ExchangePair>();

    constructor(public readonly uiService: UiActionsService,
                public readonly nebularService: NebularService,
                private readonly titleService: Title,
                private readonly assetService: AssetService) {
        titleService.setTitle("My Exchanges");
        this.exchanges = this.assetService.customExchanges;
    }


    addCustomExchange() {
        const newExchange: ExchangePair = this.assetService.CreateCustomExchange();
    }
}
