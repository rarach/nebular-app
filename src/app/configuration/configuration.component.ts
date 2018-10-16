import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AssetService } from '../asset.service';


@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {
    

    constructor(private titleService: Title, private assetService: AssetService) {
        titleService.setTitle("Nebular - Configuration");
    }

    ngOnInit() {
    }

}
