import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";

import { AssetService } from '../asset.service';


@Component({
    selector: 'app-my-exchanges',
    templateUrl: './my-exchanges.component.html',
    styleUrls: ['./my-exchanges.component.css']
})
export class MyExchangesComponent implements OnInit {

    constructor(titleService: Title, private assetService: AssetService) {
        titleService.setTitle("My Exchanges");
    }

    ngOnInit() {
    }


    addCustomExchange(): void {
      const newExchange = this.assetService.CreateCustomExchange();
    }
}
