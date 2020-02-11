import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import { OverviewComponent } from "./overview/overview.component";
import { ExchangeComponent } from "./exchange/exchange.component";
import { ExchangeAnalyticsComponent } from './exchange-analytics/exchange-analytics.component';
import { MyExchangesComponent } from "./my-exchanges/my-exchanges.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { PageNotFoundComponent } from "./not-found.component";
import { LiveTradesComponent } from './live-trades/live-trades.component';


const appRoutes: Routes = [
  { path: 'overview', component: OverviewComponent },
  { path: 'exchange/:baseAssetId/:counterAssetId', component: ExchangeComponent },
  { path: 'analyze/:baseAssetId/:counterAssetId', component: ExchangeAnalyticsComponent },
  { path: 'analyze', component: ExchangeAnalyticsComponent },
  { path: 'myExchanges', component: MyExchangesComponent },
  { path: "configuration", component: ConfigurationComponent },
  { path: "liveTrades", component: LiveTradesComponent },
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent } //TODO: 404 page
];


@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- TRUE only during debugging
    )
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
