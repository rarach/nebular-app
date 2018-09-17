import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import { OverviewComponent } from "./overview/overview.component";
import { ExchangeComponent } from "./exchange/exchange.component";
import { MyExchangesComponent } from "./my-exchanges/my-exchanges.component";
import { ConfigurationComponent } from "./configuration/configuration.component";
import { PageNotFoundComponent } from "./not-found.component";


const appRoutes: Routes = [
  { path: 'overview', component: OverviewComponent },
  { path: 'exchange/:baseAssetId/:counterAssetId', component: ExchangeComponent },
  { path: 'myExchanges', component: MyExchangesComponent },
  { path: "configuration", component: ConfigurationComponent },
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent } //TODO: 404 page
];


@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
