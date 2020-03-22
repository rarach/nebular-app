import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { NebularService } from '../services/nebular.service';


@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent {

    constructor(readonly nebularService: NebularService, titleService: Title) {
        titleService.setTitle("Nebular - Configuration");
    }
}
