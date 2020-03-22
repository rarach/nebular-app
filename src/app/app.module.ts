import { BrowserModule, Title } from '@angular/platform-browser';
import { CookieModule } from 'ngx-cookie';
import { FormsModule }   from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule, MatSortModule } from '@angular/material';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { OverviewComponent } from './overview/overview.component';
import { MyExchangesComponent } from './my-exchanges/my-exchanges.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { PageNotFoundComponent } from './not-found.component';
import { ExchangeThumbnailComponent } from './exchange-thumbnail/exchange-thumbnail.component';
import { AssetService } from './services/asset.service';
import { HorizonRestService } from "./services/horizon-rest.service";
import { UiActionsService } from './services/ui-actions.service';
import { NebularService } from './services/nebular.service';
import { TradeHistoryComponent } from './trade-history/trade-history.component';
import { OrderbookComponent } from './orderbook/orderbook.component';
import { CustomExchangeComponent } from './custom-exchange/custom-exchange.component';
import { CustomAssetsComponent } from './configuration/custom-assets/custom-assets.component';
import { ExchangeAnalyticsComponent } from './exchange-analytics/exchange-analytics.component';
import { LiveTradesComponent } from './live-trades/live-trades.component';
import { CustomAssetWizardComponent } from './configuration/custom-asset-wizard/custom-asset-wizard.component';
import { CookieConsentComponent } from './cookie-consent/cookie-consent.component';


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
        CustomAssetsComponent,
        ExchangeAnalyticsComponent,
        LiveTradesComponent,
        CustomAssetWizardComponent,
        CookieConsentComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MatSelectModule,
        MatSortModule,
        AppRoutingModule,
        CookieModule.forRoot()
    ],
    providers: [Title, AssetService, HorizonRestService, NebularService, UiActionsService],
    bootstrap: [AppComponent]
})
export class AppModule { }
