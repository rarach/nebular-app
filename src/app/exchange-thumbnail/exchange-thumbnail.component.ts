import { Component, Input, OnInit, OnDestroy, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from "@angular/router";
import zingchart from "zingchart";

import { Constants } from "../model/constants";
import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { LineChartData } from '../model/line-chart-data';
import { UiActionsService } from '../services/ui-actions.service';
import { Utils } from '../../app/utils';

@Component({
  selector: 'nebular-exchange-thumbnail',
  templateUrl: './exchange-thumbnail.component.html',
  styleUrls: ['./exchange-thumbnail.component.css']
})
export class ExchangeThumbnailComponent implements OnInit, OnDestroy {
    @Input() exchange: ExchangePair;
    @Input() showAssetNames = true;

    //View-model properties to be rendered on the UI
    lastPrice = "0.00";
    dailyChangeDesc = "0.00%";
    chartPlaceholderId: string = null;
    DataStatus=DataStatus/*ngCrap*/; dataStatus: DataStatus = DataStatus.NoData;
    userMessage = "Loading data...";

    private _isActive = false;
    private _lineChart: LineChartData = null;

    constructor(private readonly ngZone: NgZone,
                private readonly router: Router,
                private readonly horizonService: HorizonRestService,
                private readonly uiActions: UiActionsService) { }

    getUrl(): string {
      return "exchange/" + this.exchange.baseAsset.ToExchangeUrlParameter() + "/" + this.exchange.counterAsset.ToExchangeUrlParameter();
    }

    /** Setup and render the exchange chart */
    public ngOnInit(): void {
      this.chartPlaceholderId = "exch_" + this.exchange.id;
      this._lineChart = new LineChartData();

      this._lineChart.contextMenuLink(this.getUrl());
      this._isActive = true;
      this.initChartStream();
    }

    public ngOnDestroy(): void {
      this._isActive = false;
    }

    public onClick(): void {
      if (!this.uiActions.DraggingExchange) {
        this.router.navigateByUrl(this.getUrl());
      }
    }

    private renderLineChart() {
      //We always request 15min candles because with smaller interval we couldn't get 1 day worth of data in single request
      this.horizonService.getTradeAggregations(this.exchange, 900000)
        .subscribe({
          next: (response) => {
            const data = response as any;
            if (data._embedded.records.length == 0) {
              this.dataStatus = DataStatus.NoData;
              this.userMessage = "No trades in last 24 hours";
              return;
            }
            //Check age of last trade
            const minDate = new Date();
            minDate.setDate(minDate.getDate() - 1);
            const yesterday = minDate.getTime();
            const firstTimestamp = new Date(Number(data._embedded.records[0].timestamp)).getTime();
            if (firstTimestamp < yesterday) {
              //Last trade is older than 24hrs => we have no data
              this.dataStatus = DataStatus.NoData;
              this.userMessage = "No trades in last 24 hours";
              return;
            }

            this._lineChart.clearData();

            $("#"+this.chartPlaceholderId).empty();     //TODO: Angular way?
            this.dataStatus = DataStatus.OK;
            let minPrice = Number.MAX_VALUE;
            let maxPrice = -1.0;
            let lastPrice = -999999;
            let startPrice;

            for(const record of data._embedded.records) {
              const timestampAsNum = Number(record.timestamp);
              if (timestampAsNum < yesterday) {
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

              const point = [timestampAsNum, avgValue];
              this._lineChart.addPointData(point);
              this._lineChart.setStartTime(timestampAsNum);
            }

            //Special case: if we have only one point in the chart, use trick and add artificial starting point
            //              with value equal to the existing point
            if (this._lineChart.DataPointCount() === 1) {
              const artifPoint = [yesterday, startPrice];
              this._lineChart.addPointData(artifPoint);
              this._lineChart.setStartTime(yesterday);
            }

            this.setPriceStatistics(startPrice, lastPrice);
            this._lineChart.setPriceScale(minPrice, maxPrice);
            zingchart.THEME=null;
            this.ngZone.runOutsideAngular(() => {
              zingchart.render({
                id : this.chartPlaceholderId,
                data : this._lineChart.getData(),
                height: "100%",
                width: "100%"
              });
            });
          },
          error: (err) => {
            const errorResponse = err as HttpErrorResponse;
            this.userMessage = "Couldn't load data for this exchange (server: " +
                              errorResponse.error.detail + " - " + errorResponse.statusText + " [" + errorResponse.status + "])";
            this.dataStatus = DataStatus.Error;
          }
        });
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
      this._lineChart.setLineColor(dailyChange < 0.0 ? Constants.Style.RED : Constants.Style.GREEN);
      this._lineChart.setBackgroundColor(dailyChange < 0.0 ? Constants.Style.LIGHT_RED : Constants.Style.LIGHT_GREEN);
    }

    /** Reload the chart every 8 minutes */
    private initChartStream() {
      if (!this._isActive)
      {
        //Cancel the loop if user navigated away
        return;
      }
      this.renderLineChart();

      //NOTE: Angular zones trick to prevent Protractor timeouts
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.ngZone.run(() => { this.initChartStream(); });
        }, Constants.CHART_INTERVAL);
      });
    }
}
