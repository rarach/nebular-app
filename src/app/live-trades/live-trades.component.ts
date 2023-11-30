import { Component, OnInit, OnDestroy, NgZone, inject, DestroyRef } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';

import { Account } from '../model/account.model';
import { Asset } from '../model/asset.model';
import { AssetStatistics } from '../model/asset-statistics';
import { Constants } from '../model/constants';
import { HorizonRestService } from '../services/horizon-rest.service';
import { LiveTradeItem } from './live-trade-item';
import { Queue } from '../queue';
import { TomlConfigService } from '../services/toml-config.service';
import { Trade } from '../model/trade.model';
import { Utils } from '../utils';

@Component({
  selector: 'nebular-live-trades',
  templateUrl: './live-trades.component.html',
  styleUrls: ['./live-trades.component.css']
})
export class LiveTradesComponent implements OnInit, OnDestroy {
  private readonly _destroyRef = inject(DestroyRef);
  private tradesStream: Subscription;
  private streamStart: Date;
  private readonly TIMER_INTERVAL = 5000;
  private stats = new Map<string, AssetStatistics>();

  Utils = Utils;          // Template access
  public duration = "5s";    // TODO: No! Do it as template pipe that gets the timespan as number
  public readonly trades = new Queue<LiveTradeItem>(500);
  public sortedStatistics: AssetStatistics[] = null;
  private currentSort: Sort = { active: "asset", direction: "asc" };


  constructor(
    private readonly ngZone: NgZone,
    titleService: Title,
    private readonly horizonService: HorizonRestService,
    private readonly tomlService: TomlConfigService)
  {
    titleService.setTitle("Live Trades");
  }

  public ngOnInit(): void {
    let counter = 0;
    this.tradesStream = this.horizonService.streamTradeHistory().subscribe(trade => {
      const newTrade = new LiveTradeItem(trade, counter++ % 2 == 0);
      this.trades.add(newTrade);
      this.updateStatistics(trade);
    });
    this.streamStart = new Date();

    //NOTE: Angular zones trick to prevent Protractor timeouts
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.ngZone.run(() => { this.updateTime(); });
      }, this.TIMER_INTERVAL);
    });
  }

  public ngOnDestroy(): void {
    if (this.tradesStream) {
      this.tradesStream.unsubscribe();
    }
    this.stats.forEach(stat => stat.destroy());
  }


  private updateTime() {     //TODO: to formatting pipe
    let timeDiff = new Date().getTime() - this.streamStart.getTime();
    const hours = Math.floor(timeDiff / 1000 / 60 / 60);
    timeDiff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(timeDiff / 1000 / 60);
    timeDiff -= minutes * 1000 * 60;
    const seconds = Math.floor(timeDiff / 1000);

    this.duration = '';
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

  private updateStatistics(trade: Trade) { 
    if (trade.base_asset_type != Constants.NATIVE_ASSET_TYPE) {
      const key = trade.base_asset_code + "-" + trade.base_asset_issuer;
      if (!this.stats.has(key)) {
        const stat = new AssetStatistics(this.horizonService, this.tomlService, trade.base_asset_code, trade.base_asset_issuer);
        this.stats.set(key, stat);
      }
      const stat = this.stats.get(key);
      const amount = parseFloat(trade.base_amount);
      const dummyAsset = new Asset(trade.base_asset_code, null, null, new Account(trade.base_asset_issuer, null));
      this.horizonService.getLastPriceInNative(dummyAsset)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(xlmPrice => {
          stat.feedData(amount, xlmPrice);
          if (trade.counter_asset_type != Constants.NATIVE_ASSET_TYPE) {  //No need to do it twice
            this.sortStatistics(this.currentSort);
          }
        });
    }
    if (trade.counter_asset_type != Constants.NATIVE_ASSET_TYPE) {
      const key = trade.counter_asset_code + "-" + trade.counter_asset_issuer;
      if (!this.stats.has(key)) {
        const stat = new AssetStatistics(this.horizonService, this.tomlService, trade.counter_asset_code, trade.counter_asset_issuer);
        this.stats.set(key, stat);
      }
      const stat = this.stats.get(key);
      const amount = parseFloat(trade.counter_amount);
      const dummyAsset = new Asset(trade.counter_asset_code, null, null, new Account(trade.counter_asset_issuer, null));
      this.horizonService.getLastPriceInNative(dummyAsset)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(xlmPrice => {
          stat.feedData(amount, xlmPrice);
          this.sortStatistics(this.currentSort);
        });
    }
  }

  public sortStatistics(sort: Sort): void {
    this.currentSort = sort;
    const data = new Array<AssetStatistics>();
    //Slightly cumbersome way of converting hash-set values into array
    this.stats.forEach(assetStat => data.push(assetStat));

    if (!sort.active || sort.direction === '') {
      return;
    }

    this.sortedStatistics = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
      case 'asset': return this.compare(a.assetTitle, b.assetTitle, isAsc);
      case 'trades': return this.compare(a.numTrades, b.numTrades, isAsc);
      case 'volume': return this.compare(a.volumeInNative, b.volumeInNative, isAsc);
      default: return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
