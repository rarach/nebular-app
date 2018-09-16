import { Component, Input, OnInit } from '@angular/core';
import { ExchangePair } from '../model/exchange-pair.model';


@Component({
  selector: 'app-exchange-thumbnail',
  templateUrl: './exchange-thumbnail.component.html',
  styleUrls: ['./exchange-thumbnail.component.css']
})
export class ExchangeThumbnailComponent implements OnInit {
  @Input() exchange: ExchangePair;

  constructor() { }

  ngOnInit() {
  }

}
