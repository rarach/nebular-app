import { Component, Input, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from "@angular/router";
import zingchart from "zingchart";

import { Constants } from "../model/constants";
import { ExchangePair } from '../model/exchange-pair.model';
import { LineChartData } from '../model/line-chart-data.model';
import { Utils } from 'src/app/utils';
import { HorizonRestService } from '../horizon-rest.service';


@Component({
  selector: 'app-exchange-thumbnail',
  templateUrl: './exchange-thumbnail.component.html',
  styleUrls: ['./exchange-thumbnail.component.css']
})
export class ExchangeThumbnailComponent implements OnInit {
  @Input() exchange: ExchangePair;

  _placeHolderId: string = null;
  private _lineChart: LineChartData = null;

  constructor(private horizonService: HorizonRestService, private router: Router) { }

  getUrl() {
    return "exchange/" + this.exchange.baseAsset.ToExchangeUrlParameter() + "/" + this.exchange.counterAsset.ToExchangeUrlParameter();
  }

  /** Setup and render the exchange chart */
  ngOnInit() {
    this._placeHolderId = "exch_" + this.exchange.id;
    this._lineChart = new LineChartData(this._placeHolderId);

    this._lineChart.ContextMenuLink(this.getUrl());
    this.initChartStream();
  }

  onClick() {
    this.router.navigateByUrl(this.getUrl());
  }

  private renderLineChart() {
    //We always request 15min candles because with smaller interval we couldn't get 1 day worth of data in single request
    const dataRange = "&resolution=900000&limit=96";
    const url = Constants.API_URL + "/trade_aggregations?" + this.exchange.baseAsset.ToUrlParameters("base") + "&" +
                this.exchange.counterAsset.ToUrlParameters("counter") + "&order=desc" + dataRange;
    const that = this;

    this.horizonService.getTradeAggregations(this.exchange, 900000).subscribe(
      success => {
        const data = success as any;
        $("#"+that._placeHolderId).empty();
        if (data._embedded.records.length == 0) {
            that._lineChart.ShowWarning("No trades in last 24 hours");
            return;
        }
        //Check age of last trade
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - 1);
        const yesterday = minDate.getTime();
        const firstTimestamp = new Date(data._embedded.records[0].timestamp).getTime();
        if (firstTimestamp < yesterday) {
            //Last trade is older than 24hrs => we have no data
            that._lineChart.ShowWarning("No trades in last 24 hours");
            return;
        }

        that._lineChart.ClearData();

        $("#"+that._placeHolderId).empty();
        let minPrice = Number.MAX_VALUE;
        let maxPrice = -1.0;
        let lastPrice = -999999;
        let startPrice;

        $.each(data._embedded.records, function(i, record) {    //TODO: for sure TypeScript has better foreach
            if (record.timestamp < yesterday) {
                return false;    //'break' at first value older than 24hrs
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
        });

        //Special case: if we have only one point in the chart, use trick and add artificial starting point
        //              with value equal to the existing point
        if (that._lineChart.DataPointCount() === 1) {
            const artifPoint = [yesterday, startPrice];
            that._lineChart.AddPointData(artifPoint);
            that._lineChart.SetStartTime(yesterday);
        }

        that.setPriceStatistics(startPrice, lastPrice);
        that._lineChart.SetPriceScale(minPrice, maxPrice);
        zingchart.render({
          id : that._placeHolderId,
          data : that._lineChart.getChartConfigData(),
          height: "100%",
          width: "100%"
      });
      },
      error => {
        const errorResponse = error as HttpErrorResponse;
        const userMessage = errorResponse.error.detail + " - " + errorResponse.statusText + " (" + errorResponse.status + ") ";
        that._lineChart.ShowError(userMessage);
      }
    );
  }

  /** Show some basic statistics in the header */
  private setPriceStatistics(startPrice: number, lastPrice: number) {
    //Set last price
    const decimals = Utils.getPrecisionDecimals(lastPrice);
    const priceAsString = lastPrice.toFixed(decimals);
    const assetsDescDIV = $("#"+this._placeHolderId).siblings(".assetsDescription");
    $(assetsDescDIV).find(".lastPrice").text(priceAsString);

    //Set daily change as percentage
    let dailyChange = lastPrice / startPrice -1.0;
    dailyChange *= 100.0;
    const changeAsString = (dailyChange <= 0.0 ? "" : "+") +  dailyChange.toFixed(2) + "%";
    const cssClass = dailyChange < 0.0 ? "red" : "green";
    this._lineChart.SetLineColor(dailyChange < 0.0 ? Constants.Style.RED : Constants.Style.GREEN);
    this._lineChart.SetBackgroundColor(dailyChange < 0.0 ? Constants.Style.LIGHT_RED : Constants.Style.LIGHT_GREEN);

    const aDiv = $(assetsDescDIV).find(".dailyChangePercent");
    $(aDiv).removeClass("red").removeClass("green").addClass(cssClass).text(changeAsString);
  }

  /** Reload the chart every 8 minutes */
  private initChartStream() {
    this.renderLineChart();

    setTimeout(function() {
      this.initChartStream();
    }, Constants.CHART_INTERVAL);
  };
}
