import { Component } from '@angular/core';
import { Title }     from '@angular/platform-browser';
import { AssetService } from './asset.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public constructor(private titleService: Title, private assetService: AssetService) { }

  config = 'asdf_todo';
}
