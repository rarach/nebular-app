import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Subscription } from "rxjs";
import { Title } from '@angular/platform-browser';

import { Constants } from '../model/constants';
import { HorizonRestService } from '../services/horizon-rest.service';
import { IssuerConfiguration } from '../model/toml/issuer-configuration';
import { LiveTradeItem } from './live-trade-item';
import { TomlConfigService } from '../services/toml-config.service';
import { Trade } from '../model/trade.model';


@Component({
    selector: 'app-live-trades',
    templateUrl: './live-trades.component.html',
    styleUrls: ['./live-trades.component.css']
})
export class LiveTradesComponent implements OnInit, OnDestroy {
    private tradesStream: Subscription;
    private streamStart: Date;
    private readonly TIMER_INTERVAL = 5000;

    public duration = "5s";    //TODO: No! Do it as template pipe that gets the timespan as number
    public trades = new Array<LiveTradeItem>();
    public stats = new Map<string, AssetStatistics>();


    constructor(private readonly ngZone: NgZone,
                titleService: Title,
                private horizonService: HorizonRestService,
                private tomlService: TomlConfigService) {
        titleService.setTitle("Live Trades");
    }

    ngOnInit() {
        this.tradesStream = this.horizonService.streamTradeHistory().subscribe(trade => {
            this.trades.splice(0, 0, new LiveTradeItem(trade));
            this.calculateStatistics(trade);
        });
        this.streamStart = new Date();

        //NOTE: Angular zones trick to prevent Protractor timeouts
        this.ngZone.runOutsideAngular(() => {
            setInterval(() => {
                this.ngZone.run(() => { this.updateTime(); });
            }, this.TIMER_INTERVAL);
        });
    }

    ngOnDestroy() {
        if (this.tradesStream) {
            this.tradesStream.unsubscribe();
        }
    }

    private updateTime() {     //TODO: to formatting pipe
        let timeDiff = new Date().getTime() - this.streamStart.getTime();
        const hours = Math.floor(timeDiff / 1000 / 60 / 60);
        timeDiff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(timeDiff / 1000 / 60);
        timeDiff -= minutes * 1000 * 60;
        const seconds = Math.floor(timeDiff / 1000);

        this.duration = "";
        if (hours > 0) {
        this.duration = `${hours}h ${minutes}m`;
        }
        else if (minutes > 0) {
            this.duration = `${minutes}m ${seconds}s`;
        }
        else {
            this.duration = `${seconds}s`;
        }
    }

    private calculateStatistics(trade: Trade) { 
        if (trade.base_asset_type != Constants.NATIVE_ASSET_TYPE) {
            const key = trade.base_asset_code + "-" + trade.base_asset_issuer;
            if (!this.stats.has(key)) {
                const stat = new AssetStatistics(this.horizonService, this.tomlService, trade.base_asset_code, trade.base_asset_issuer);
                this.stats.set(key, stat);
            }
            const stat = this.stats.get(key);
            const amount = parseFloat(trade.base_amount);
            stat.feedData(amount);
        }
        if (trade.counter_asset_type != Constants.NATIVE_ASSET_TYPE) {
            const key = trade.counter_asset_code + "-" + trade.counter_asset_issuer;
            if (!this.stats.has(key)) {
                const stat = new AssetStatistics(this.horizonService, this.tomlService, trade.counter_asset_code, trade.counter_asset_issuer);
                this.stats.set(key, stat);
            }
            const stat = this.stats.get(key);
            const amount = parseFloat(trade.counter_amount);
            stat.feedData(amount);
        }
    }
}

export class AssetStatistics {    //TODO: to its own file
    public assetTitle: string;
    public assetIcon: string;
    public numTrades: number = 0;
    public volume: number = 0.0;

    constructor(horizonSerice: HorizonRestService,
                configService: TomlConfigService,
                private assetCode: string,
                private issuer: string) {
        horizonSerice.getIssuerConfigUrl(assetCode, issuer).subscribe(configUrl => {
            if (configUrl) {
                configService.getIssuerConfig(configUrl).subscribe(issuerConfig => {
                    this.loadAssetData(issuerConfig);
                });

                //Derive asset's domain from config URL
                const domain = this.parseDomain(configUrl);
                this.assetTitle = this.assetCode + "-" + domain;
            }
            else {
                this.assetTitle = this.assetCode + "-" + this.issuer.substring(0, 6) + "..." + this.issuer.substring(50);
                this.assetIcon = `./assets/images/asset_icons/${this.assetCode}.png`;
            }
        });
    }

    public feedData(amount: number) {
        this.numTrades++;
        this.volume += amount;
    }


    private loadAssetData(issuerConfig: IssuerConfiguration) {
        const theAsset = issuerConfig.currencies.find(asset => {
            return asset.code === this.assetCode && asset.issuer === this.issuer;
        });
        this.assetIcon = theAsset ? theAsset.image : null;
        if (!this.assetIcon) {
            //If no icon was provided, try our basic database
            this.assetIcon = `./assets/images/asset_icons/${this.assetCode}.png`;
        }
    }

    private parseDomain(configUrl: string): string {
        const chunks = configUrl.split("/");
        for (let i = 1; i < chunks.length; i++) {
            if (chunks[i]) {
                return chunks[i];
            }
        }

        return null;
    }
}
