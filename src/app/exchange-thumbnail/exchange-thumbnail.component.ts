import { Component, Input, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from "@angular/router";
import zingchart from "zingchart";

import { Constants } from "../model/constants";
import { ExchangePair } from '../model/exchange-pair.model';
import { LineChartData } from '../model/line-chart-data.model';
import { Utils } from 'src/app/utils';
import { HorizonRestService } from '../horizon-rest.service';
import { DataStatus } from '../model/data-status.enum';


@Component({
  selector: 'app-exchange-thumbnail',
  templateUrl: './exchange-thumbnail.component.html',
  styleUrls: ['./exchange-thumbnail.component.css']
})
export class ExchangeThumbnailComponent implements OnInit {
  @Input() exchange: ExchangePair;

  //View-model properties to be rendered on the UI
  lastPrice = "0.00";
  dailyChangeDesc: string = "0.00%";
  chartPlaceholderId: string = null;
  DataStatus=DataStatus/*ngCrap*/; dataStatus: DataStatus = DataStatus.NoData;
  userMessage: string = "Loading data...";

  private _lineChart: LineChartData = null;

  constructor(private horizonService: HorizonRestService, private router: Router) { }

  getUrl() {
    return "exchange/" + this.exchange.baseAsset.ToExchangeUrlParameter() + "/" + this.exchange.counterAsset.ToExchangeUrlParameter();
  }

  /** Setup and render the exchange chart */
  ngOnInit() {
    this.chartPlaceholderId = "exch_" + this.exchange.id;
    this._lineChart = new LineChartData();

    this._lineChart.ContextMenuLink(this.getUrl());
    this.initChartStream();
  }

  onClick() {
    this.router.navigateByUrl(this.getUrl());
  }

  private renderLineChart() {
    //We always request 15min candles because with smaller interval we couldn't get 1 day worth of data in single request
    this.horizonService.getTradeAggregations(this.exchange, 900000).subscribe(
      success => {
        const data = success as any;
        $("#"+this.chartPlaceholderId).empty();   //TODO: DYOR. Maybe Angular has some smart means
        if (data._embedded.records.length == 0) {
          this.dataStatus = DataStatus.NoData;
          this.userMessage = "No trades in last 24 hours";
          return;
        }
        //Check age of last trade
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - 1);
        const yesterday = minDate.getTime();
        const firstTimestamp = new Date(data._embedded.records[0].timestamp).getTime();
        if (firstTimestamp < yesterday) {
            //Last trade is older than 24hrs => we have no data
            this.dataStatus = DataStatus.NoData;
            this.userMessage = "No trades in last 24 hours";
            return;
        }

        this._lineChart.ClearData();

        $("#"+this.chartPlaceholderId).empty();     //TODO: Angular way?
        let minPrice = Number.MAX_VALUE;
        let maxPrice = -1.0;
        let lastPrice = -999999;
        let startPrice;

        const that = this;
        for(let record of data._embedded.records) {
            if (record.timestamp < yesterday) {
              break;    //Break at first value older than 24hrs
            }

            //Collect value for a single point in the chart as average
            const avgValue = parseFloat(record.avg);
            if (lastPrice === -999999) {
                lastPrice = avgValue;
            }
            startPrice = avgValue;

            if (avgValue > maxPrice) {
                maxPrice = avgValue;
            }
            if (avgValue < minPrice) {
                minPrice = avgValue;
            }

            const point = [record.timestamp, avgValue];
            that._lineChart.AddPointData(point);
            that._lineChart.SetStartTime(record.timestamp);
        }

        //Special case: if we have only one point in the chart, use trick and add artificial starting point
        //              with value equal to the existing point
        if (this._lineChart.DataPointCount() === 1) {
            const artifPoint = [yesterday, startPrice];
            this._lineChart.AddPointData(artifPoint);
            this._lineChart.SetStartTime(yesterday);
        }

        this.setPriceStatistics(startPrice, lastPrice);
        this._lineChart.SetPriceScale(minPrice, maxPrice);
        zingchart.render({
          id : this.chartPlaceholderId,
          data : this._lineChart.getChartConfigData(),
          height: "100%",
          width: "100%"
      });
      },
      error => {
        const errorResponse = error as HttpErrorResponse;
        this.userMessage = "Couldn't load data for this exchange (server: " +
                           errorResponse.error.detail + " - " + errorResponse.statusText + " [" + errorResponse.status + "])";
        this.dataStatus = DataStatus.Error;
      }
    );
  }

  /** Show some basic statistics in the header */
  private setPriceStatistics(startPrice: number, price: number) {
    //Set last price
    const decimals = Utils.getPrecisionDecimals(price);
    this.lastPrice = price.toFixed(decimals);

    //Set daily change as percentage
    let dailyChange = price / startPrice -1.0;
    dailyChange *= 100.0;
    this.dailyChangeDesc = (dailyChange <= 0.0 ? "" : "+") +  dailyChange.toFixed(2) + "%";
    this._lineChart.SetLineColor(dailyChange < 0.0 ? Constants.Style.RED : Constants.Style.GREEN);
    this._lineChart.SetBackgroundColor(dailyChange < 0.0 ? Constants.Style.LIGHT_RED : Constants.Style.LIGHT_GREEN);
  }

  /** Reload the chart every 8 minutes */
  private initChartStream() {
    this.renderLineChart();

    setTimeout(() => {
      this.initChartStream();
    }, Constants.CHART_INTERVAL);
  };
}
