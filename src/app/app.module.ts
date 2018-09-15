import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { OverviewComponent } from './overview/overview.component';
import { MyExchangesComponent } from './my-exchanges/my-exchanges.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { PageNotFoundComponent } from './not-found.component';
import { AssetService } from './asset.service';


@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    MyExchangesComponent,
    ExchangeComponent,
    ConfigurationComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [Title, AssetService],
  bootstrap: [AppComponent]
})
export class AppModule { }
