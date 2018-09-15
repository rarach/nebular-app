import { Component, OnInit } from '@angular/core';
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-my-exchanges',
  templateUrl: './my-exchanges.component.html',
  styleUrls: ['./my-exchanges.component.css']
})
export class MyExchangesComponent implements OnInit {

  constructor(private titleService: Title) {
    titleService.setTitle("My Exchanges");
  }

  ngOnInit() {
  }

}
