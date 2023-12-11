import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatOption } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import zingchart from "zingchart";

import { Asset } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { CandlestickChartData } from '../model/candlestick-chart-data';
import { Constants, GETParams } from '../model/constants';
import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { ExecutedTrade } from '../model/executed-trade.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { OhlcData } from 'app/model/ohlc-data';
import { Utils } from '../utils';

@Component({
  selector: 'nebular-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, OnDestroy {
  private static readonly PAST_TRADES_INTERVAL: number = 8000;
  private _isActive = false;
  private _routeSubscriber: Subscription;

  //View-model properties
  chartInterval = 900000;    //15min candles by default
  exchange: ExchangePair = null;
  tradeHistory: ExecutedTrade[] = new Array<ExecutedTrade>();
  DataStatus=DataStatus/*ngCrap*/; dataStatus: DataStatus = DataStatus.OK;
  lastPrice = 0.0;
  lastTradeType = "";
  lastTradeTime: Date = null;
  chartMessage = "Loading chart...";
  assetOptions: Asset[] = [];
  selectedBaseAsset: Asset = null;
  selectedCounterAsset: Asset = null;


  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private assetService: AssetService,
    private horizonService: HorizonRestService
  ) {
    this.assetOptions = assetService.availableAssets;
  }


  public ngOnInit(): void {
    this._routeSubscriber = this.route.paramMap.subscribe(params => {
      //'Parse' the route
      const baseAssetString = params.get('baseAssetId');
      const counterAssetString = params.get('counterAssetId');
      const intParam = params.get(GETParams.INTERVAL);

      if ((baseAssetString || "").length <= 0) {
        this.dataStatus = DataStatus.Error;
        this.chartMessage = "Invalid URL: missing base asset";
        return;
      }
      if ((counterAssetString || "").length <= 0) {
        this.dataStatus = DataStatus.Error;
        this.chartMessage = "Invalid URL: missing counter asset";
        return;
      }
      if (intParam) {
        this.chartInterval = Utils.intervalAsMilliseconds(intParam);
      }

      const baseAsset: Asset = this.assetService.getAsset(baseAssetString);
      const counterAsset: Asset = this.assetService.getAsset(counterAssetString);
      this.exchange = new ExchangePair("asdf123", baseAsset, counterAsset);
      this.setupUi();
    });

    this._isActive = true;
    this.initPastTradesStream();
    this.initChartStream();
  }

  public ngOnDestroy(): void {
    this._isActive = false;
    this._routeSubscriber.unsubscribe();
  }

  private setupUi() {
    //Set selected option in base asset code drop-down
    let baseAssetDdOption: Asset = null;
    for (const asset of this.assetOptions) {
      if (asset.code === this.exchange.baseAsset.code && asset.issuer.address === this.exchange.baseAsset.issuer.address) {   //TODO: introduce Asset.Id, compare them
        baseAssetDdOption = asset;
        break;
      }
    }
    //User provided unknown asset code in URL
    if (null === baseAssetDdOption) {
      baseAssetDdOption = this.exchange.baseAsset;
      this.assetOptions.splice(0, 0, baseAssetDdOption);
    }
    this.selectedBaseAsset = baseAssetDdOption;

    //Set selected option in counter asset code drop-down
    let counterAssetDdOption: Asset = null;
    for (const asset of this.assetOptions) {
      if (asset.code === this.exchange.counterAsset.code && asset.issuer.address === this.exchange.counterAsset.issuer.address) {   //TODO: introduce Asset.Id, compare them
        counterAssetDdOption = asset;
        break;
      }
    }
    //User provided unknown asset code in URL
    if (null === counterAssetDdOption) {
      counterAssetDdOption = this.exchange.counterAsset;
      this.assetOptions.splice(0, 0, counterAssetDdOption);
    }
    this.selectedCounterAsset = counterAssetDdOption;

    this.updateTradeHistory();
    this.renderCandlestickChart(true);
  }

  /** Switch base and couter asset */
  public swapAssets(): void {
    const url = "exchange/" + this.exchange.counterAsset.ToExchangeUrlParameter() + "/" +
                this.exchange.baseAsset.ToExchangeUrlParameter() + "?"+GETParams.INTERVAL+"=" + this.chartInterval;
    this.router.navigateByUrl(url);
  }

  /** Set chart interval (i.e. 'size' of one candle) */
  public setChartInterval(intervalDesc: string): void {
    this.chartMessage = "Loading chart...";
    this.chartInterval = Utils.intervalAsMilliseconds(intervalDesc);

    const url = this.router.createUrlTree([{interval: this.chartInterval}], {relativeTo: this.route}).toString();
    this.router.navigateByUrl(url);
  }

  /**
   * @param reinit true if old ZingChart object should be destroyed before new one is initialized. Useful for refreshing
   * the same exchange if just new data arrived, so it doesn't "flicker" on the screen.
   */
  private renderCandlestickChart(reinit: boolean) {
    if (reinit) {
      this.chartMessage = "Loading chart...";
      zingchart.exec("marketChart", "destroy");
    }
    const chartData = new CandlestickChartData(this.exchange.counterAsset.code);

    this.horizonService.getTradeAggregations(this.exchange, this.chartInterval, 70).subscribe({
      next : (success) => {
        const data = success as any;
        if (data._embedded.records.length == 0) {
          this.dataStatus = DataStatus.NoData;
          this.chartMessage = "No trades in this exchange";
          return;
        }

        //Check age of last trade, show candles only for specific number of last days, depending on current scale
        const minDate = new Date();
        const chartRangeInDays = this.getChartRangeByInterval();
        minDate.setDate(minDate.getDate() - chartRangeInDays);
        const rangeStart = minDate.getTime();
        const firstTimestamp = new Date(Number(data._embedded.records[0].timestamp)).getTime();
        if (firstTimestamp < rangeStart) {
          //Last trade is older than date range => we have no data
          this.dataStatus = DataStatus.NoData;
          this.chartMessage = `No trades in last ${chartRangeInDays} days`;
          return;
        }

        this.dataStatus = DataStatus.OK;
        this.chartMessage = "";
        let minPrice = Number.MAX_VALUE;
        let maxPrice = -1.0;
        let maxVolume = -1.0;
        let globalOpen = -1.0;
        let globalClose = -1.0
        let volumeSum = 0.0;

        //Collect data for a single candle in the candlestick chart
        for (const record of data._embedded.records) {
          const timestampAsNum = Number(record.timestamp);
          if (timestampAsNum < rangeStart) {
            break;    //Break at first value older than range start
          }
          const open = parseFloat(record.open);
          globalOpen = open;
          const high = parseFloat(record.high);
          if (high > maxPrice) {
            maxPrice = high;
          }
          const low = parseFloat(record.low);
          if (low < minPrice) {
            minPrice = low;
          }
          const close = parseFloat(record.close);
          if (-1.0 == globalClose) {
            globalClose = close;
          }
          const candle: OhlcData = {      //BUG: Horizon seems to have open and closed messed sometimes
            timestamp: timestampAsNum,
            open: open,
            high: high,
            low: low,
            close: close
          };

          //Collect data for bar chart with volume
          const volume = parseFloat(record.base_volume);
          if (volume > maxVolume) {
            maxVolume = volume;
          }
          volumeSum += volume;
          const volumeBar = [timestampAsNum, volume];
          chartData.addCandleData(candle, volumeBar);
          chartData.setStartTime(timestampAsNum);
        }

        chartData.setCandleSize(this.chartInterval);
        chartData.setVolumeDecimals(maxVolume >= 10.0 ? 2 : 4/*Lame but works*/);
        chartData.setPriceScale(minPrice, maxPrice);
        //Set volume chart range
        chartData.setVolumeScale(maxVolume);

        zingchart.THEME="classic";
        zingchart.render({
          id : "marketChart",
          data : chartData.getData(),
          height: "100%",
          width: "100%"
        });
        this.showGlobalOhlcData(globalOpen, maxPrice, minPrice, globalClose, volumeSum);
      },
      error: (errorData) => {
        const errorResponse = errorData as HttpErrorResponse;
        this.chartMessage = "Couldn't load data for this exchange (server: " +
                                    errorResponse.error.detail + " - " + errorResponse.statusText + " [" + errorResponse.status + "])";
        this.dataStatus = DataStatus.Error;
      }
    });
  }

  private showGlobalOhlcData(open: number, high: number, low: number, close: number, volume: number) {
    //Dirty hack to show global OHLC numbers in the top labels before user starts moving cursor over the chart
    $("text[id^='marketChart-graph-id0-label-lbl_0_']").find("tspan").text("open: " + open);
    $("text[id^='marketChart-graph-id0-label-lbl_1_']").find("tspan").text("high: " + high);
    $("text[id^='marketChart-graph-id0-label-lbl_2_']").find("tspan").text("low: " + low);
    $("text[id^='marketChart-graph-id0-label-lbl_3_']").find("tspan").text("close: " + close);
    $("text[id^='marketChart-graph-id0-label-lbl_4_']").find("tspan").text("volume: " + volume);
  }

  public initChartStream(): void {
    if (!this._isActive)
    {
      //Cancel the loop if user navigated away
      return;
    }
    this.renderCandlestickChart(false);

    setTimeout(() => this.initChartStream(), Constants.CHART_INTERVAL);
  }

  /****************************** Trade history (right side panel) ******************************/
  private updateTradeHistory() {
    this.horizonService.getTradeHistory(this.exchange, 40).subscribe({
      next: (success) => {
        const data = success as any;

        this.tradeHistory = new Array<ExecutedTrade>();
        if (data._embedded.records.length === 0) {
          this.titleService.setTitle(this.exchange.baseAsset.code + "/" + this.exchange.counterAsset.code);
          this.lastPrice = 0.0;
          this.lastTradeType = "";
          this.lastTradeTime = null;
        }
        else {
          const pageTitle = this.currentPriceTitle(data._embedded.records[0]);
          if (!this._isActive) {
            return;     //Little bit of race condition here. If user just left this page we don't want to overwrite the title.
          }
          this.titleService.setTitle(pageTitle);

          //Check age of last trade, show only trades for specific number of last days, depending on current scale
          const minDate = new Date();
          const chartRangeInDays = this.getChartRangeByInterval();
          minDate.setDate(minDate.getDate() - chartRangeInDays);
          const rangeStart = minDate.getTime();
          const firstTimestamp = new Date(data._embedded.records[0].ledger_close_time).getTime();
          if (firstTimestamp < rangeStart) {
            //Last trade is older than date range => we have no data
            return;
          }

          let lastDay = -1;
          for(const record of data._embedded.records) {
            if (record.timestamp < rangeStart) {
              break;    //Break at first value older than range start
            }
            const sellPrice = record.price.n / record.price.d;
            const amount = parseFloat(record.base_amount);
            const time = new Date(record.ledger_close_time);
            const tradeType = record.base_is_seller ? "buy" : "sell";
            const isLastThatDay = lastDay > -1 && time.getDay() != lastDay;
            lastDay = time.getDay();
            this.tradeHistory.push(new ExecutedTrade(time, tradeType, sellPrice, amount, record.base_account, record.counter_account, isLastThatDay));
          }
        }
      },
      error: (err) => {
        const errorResponse = err as HttpErrorResponse;
        const message = `Couldn't load trade history for this exchange (server: ${errorResponse.error.detail} - ${errorResponse.statusText} [${errorResponse.status}])`;
        console.warn(message);
        this.dataStatus = DataStatus.Error;
        this.lastPrice = -1;
        this.lastTradeType = "error";
      }
    });
  }

  private initPastTradesStream() {
    if (!this._isActive)
    {
      //Cancel the loop if user navigated away
      return;
    }
    this.updateTradeHistory();

    setTimeout(() => this.initPastTradesStream(), ExchangeComponent.PAST_TRADES_INTERVAL);
  }
  /**********************************************************************************************/

  private getChartRangeByInterval(): number {
    switch(this.chartInterval)
    {
    case 300000:    //5min => 1 day
      return 1;
    case 900000:    //15min => 2 days
      return 2;
    case 3600000:   //1 hour => 8 days
      return 8;
    case 86400000:  //1 day => 192 days
      return 192;
    default:
      return 999999;  //unlimited (show as many candles as we got from the API)
    }
  }

  private currentPriceTitle(record) {
    const sellPrice = record.price.n / record.price.d;
    this.lastPrice = sellPrice;
    this.lastTradeType = record.base_is_seller ? "buy" : "sell"
    this.lastTradeTime = new Date(record.ledger_close_time);
    return this.exchange.baseAsset.code + "/" + this.exchange.counterAsset.code + " - " + Utils.formatPrice(sellPrice);
  }

  /*********************************** Asset drop-downs ***********************************/
  public assetChanged(event: MatOption): void {
    if (null === event.value) {
      this.router.navigateByUrl(Constants.CONFIGURATION_URL);
    }
    else {
      this.navigateToNewExchange();
    }
  }

  private navigateToNewExchange() {
    let urlAssets: string = this.selectedBaseAsset.code;
    if (!this.selectedBaseAsset.IsNative()) {
      urlAssets += '-' + this.selectedBaseAsset.issuer.address;
    }

    urlAssets += "/" + this.selectedCounterAsset.code;
    if (!this.selectedCounterAsset.IsNative()) {
      urlAssets += "-" + this.selectedCounterAsset.issuer.address;
    }

    const newUrl = "exchange/" + urlAssets + "?"+GETParams.INTERVAL+"=" + this.chartInterval;
    this.router.navigateByUrl(newUrl);
  }
  /**********************************************************************************************/
}
