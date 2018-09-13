import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from "./app.component";


const appRoutes: Routes = [
  { path: 'overview', component: AppComponent/*TODO: OverviewComponent*/ },
//TODO  { path: 'exchange/base_stuff_here/counter_stuff_here', component: ExchangeComponent },
  { path: '', redirectTo: '/overview', pathMatch: 'full' },
  { path: '**', component: AppComponent } //Redirect unknown paths to the home page
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
