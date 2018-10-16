import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CookieModule } from 'ngx-cookie';

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
import { OrderbookComponent } from './orderbook/orderbook.component';
import { CustomExchangeComponent } from './custom-exchange/custom-exchange.component';
import { CustomAssetCodesComponent } from './configuration/custom-asset-codes/custom-asset-codes.component';


@NgModule({
    declarations: [
        AppComponent,
        OverviewComponent,
        MyExchangesComponent,
        ExchangeComponent,
        ConfigurationComponent,
        PageNotFoundComponent,
        ExchangeThumbnailComponent,
        TradeHistoryComponent,
        OrderbookComponent,
        CustomExchangeComponent,
        CustomAssetCodesComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        CookieModule.forRoot()
    ],
    providers: [Title, AssetService, HorizonRestService],
    bootstrap: [AppComponent]
})
export class AppModule { }
