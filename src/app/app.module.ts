import { BrowserModule, Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { OverviewComponent } from './overview/overview.component';
import { MyExchangesComponent } from './my-exchanges/my-exchanges.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { PageNotFoundComponent } from './not-found.component';
import { ExchangeThumbnailComponent } from './exchange-thumbnail/exchange-thumbnail.component';
import { AssetService } from './asset.service';
import { HorizonRestService } from "./horizon-rest.service";
import { TradeHistoryComponent } from './trade-history/trade-history.component';


@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    MyExchangesComponent,
    ExchangeComponent,
    ConfigurationComponent,
    PageNotFoundComponent,
    ExchangeThumbnailComponent,
    TradeHistoryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [Title, AssetService, HorizonRestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
