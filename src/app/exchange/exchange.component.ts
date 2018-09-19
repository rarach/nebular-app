import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import zingchart from "zingchart";

import { Asset } from '../model/asset.model';
import { AssetService } from '../asset.service';
import { CandlestickChartData } from '../model/candlestick-chart-data';
import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../horizon-rest.service';
import { Utils } from '../utils';


@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, OnDestroy {
  private _routeSubscriber: Subscription;
  private _getParamsSubscriber: Subscription;
  private _chartInterval: number = 900000;    //15min candles by default
  private readonly _baseAssetDdId = "baseAssetCodeDd";
  private readonly _baseAnchorDdId = "baseIssuerDd";
  private readonly _counterAssetDdId = "counterAssetCodeDd";
  private readonly _counterAnchorDdId = "counterIssuerDd";

  //View-model properties
  exchange: ExchangePair = null;
  DataStatus=DataStatus/*ngCrap*/; dataStatus: DataStatus = DataStatus.NoData;
  chartMessage: string = "Loading chart...";


  constructor(private route: ActivatedRoute, private router: Router, private assetService: AssetService, private horizonService: HorizonRestService) {
    //Setup ZingChart
    zingchart.THEME="classic";
  }


  ngOnInit() {
    this._routeSubscriber = this.route.paramMap.subscribe(params => {
      //'Parse' the route
      const baseAssetString = params.get('baseAssetId');
      const counterAssetString = params.get('counterAssetId');

      if ((baseAssetString || "").length <= 0) {
        throw new Error("Invalid URL parameters");
      }
      if ((counterAssetString || "").length <= 0) {
        throw new Error("Invalid URL parameters (missing counter asset): ");
      }
      const baseAsset: Asset = Asset.ParseFromUrlParam(baseAssetString, this.assetService/*TODO: this dependency feels wrong*/);
      const counterAsset: Asset = Asset.ParseFromUrlParam(counterAssetString, this.assetService);
      this.exchange = new ExchangePair("asdf123", baseAsset, counterAsset);
    });
    //Handle GET parameter 'interval'
    this._getParamsSubscriber = this.route.queryParamMap.subscribe(params => {
      const intParam = params.get('interval');
      this._chartInterval = Utils.intervalAsMilliseconds(intParam);
    });

    //TODO: order books, past trades, drop-downs...
    this.renderCandlestickChart();
  }

  ngOnDestroy() {
    this._routeSubscriber.unsubscribe();
  }

  swapAssets() {
    const url = "exchange/" + this.exchange.counterAsset.ToExchangeUrlParameter() + "/" +
                this.exchange.baseAsset.ToExchangeUrlParameter() + "?interval=" + this._chartInterval;
    this.router.navigateByUrl(url);
  }



  private renderCandlestickChart() {
    const chartData = new CandlestickChartData(this.exchange.counterAsset.code);

    this.horizonService.getTradeAggregations(this.exchange, 900000, 70).subscribe(
      success => {
        const data = success as any;
        $("#marketChart").empty();      //TODO: Angular way
        if (data._embedded.records.length == 0) {
          this.chartMessage = "No data";    //TODO: "No trades in last XYZ days"
          return;
        }

        let minPrice = Number.MAX_VALUE;
        let maxPrice = -1.0;
        let maxVolume = -1.0;
        let globalOpen = -1.0;
        let globalClose = -1.0
        let volumeSum = 0.0;

        for (let record of data._embedded.records) {
          //Collect data for a single candle in the candlestick chart
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
          const candle = [record.timestamp, [open, high, low, close]];      //BUG: Horizon seems to have open and closed messed sometimes

          //Collect data for bar chart with volume
          const volume = parseFloat(record.base_volume);
          if (volume > maxVolume) {
              maxVolume = volume;
          }
          volumeSum += volume;
          const volumeBar = [record.timestamp, volume];
          chartData.AddCandleData(candle, volumeBar);
          chartData.setStartTime(record.timestamp);
        }

        chartData.SetCandleSize(this._chartInterval);
        chartData.SetVolumeDecimals(maxVolume >= 10.0 ? 2 : 4/*Lame but works*/);
        chartData.setPriceScale(minPrice, maxPrice);
        //Set volume chart range
        chartData.SetVolumeScale(maxVolume);

        zingchart.render({
          id : "marketChart",
          data : chartData.getData(),
          height: "100%",
          width: "100%"
        });
        this.showGlobalOhlcData(globalOpen, maxPrice, minPrice, globalClose, volumeSum);
      },
      error => {
        const errorResponse = error as HttpErrorResponse;
        this.chartMessage = "Couldn't load data for this exchange (server: " +
                            errorResponse.error.detail + " - " + errorResponse.statusText + " [" + errorResponse.status + "])";
        this.dataStatus = DataStatus.Error;
      });
  };

  private showGlobalOhlcData(open: number, high: number, low: number, close: number, volume: number) {
    //Dirty hack to show global OHLC numbers in the top labels before user starts moving cursor over the chart
    $("text[id^='marketChart-graph-id0-label-lbl_0_']").find("tspan").text("open: " + open);
    $("text[id^='marketChart-graph-id0-label-lbl_1_']").find("tspan").text("high: " + high);
    $("text[id^='marketChart-graph-id0-label-lbl_2_']").find("tspan").text("low: " + low);
    $("text[id^='marketChart-graph-id0-label-lbl_3_']").find("tspan").text("close: " + close);
    $("text[id^='marketChart-graph-id0-label-lbl_4_']").find("tspan").text("volume: " + volume);
  }
}
