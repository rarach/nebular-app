import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';


@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent {
    constructor(titleService: Title) {
        titleService.setTitle("Nebular - Configuration");
    }
}
