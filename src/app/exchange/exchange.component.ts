import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import zingchart from "zingchart";

import { Account } from "../model/account.model";
import { Asset, KnownAssets } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { CandlestickChartData } from '../model/candlestick-chart-data';
import { Constants, GETParams } from '../model/constants';
import { DataStatus } from '../model/data-status.enum';
import { ExchangePair } from '../model/exchange-pair.model';
import { ExecutedTrade } from '../model/executed-trade.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { Utils } from '../utils';

declare var jQuery: any;  //Supporting jQuery's plugin ddSlick


@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, OnDestroy {
    private readonly _baseAssetDdId = "baseAssetCodeDd";
    private readonly _baseAnchorDdId = "baseIssuerDd";
    private readonly _counterAssetDdId = "counterAssetCodeDd";
    private readonly _counterAnchorDdId = "counterIssuerDd";
    private static readonly PAST_TRADES_INTERVAL: number = 8000;
    private _isActive = false;
    private _routeSubscriber: Subscription;

    //View-model properties
    chartInterval: number = 900000;    //15min candles by default
    exchange: ExchangePair = null;
    tradeHistory: ExecutedTrade[] = new Array<ExecutedTrade>();
    DataStatus=DataStatus/*ngCrap*/; dataStatus: DataStatus = DataStatus.OK;
    lastPrice: number = 0.0;
    lastTradeType: string = "";
    chartMessage: string = "Loading chart...";


    constructor(private route: ActivatedRoute, private router: Router, private titleService: Title,
                private assetService: AssetService, private horizonService: HorizonRestService) {
    }


    ngOnInit() {
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

            const baseAsset: Asset = Asset.ParseFromUrlParam(baseAssetString, this.assetService/*TODO: this dependency feels wrong*/);
            const counterAsset: Asset = Asset.ParseFromUrlParam(counterAssetString, this.assetService);
            this.exchange = new ExchangePair("asdf123", baseAsset, counterAsset);
            this.setupUi();
        });

        this._isActive = true;
        this.initPastTradesStream();
        this.initChartStream();
    }

    ngOnDestroy() {
        this._isActive = false;
        this._routeSubscriber.unsubscribe();
    }

    private setupUi() {
        this.setupAssetCodesDropDown(this._baseAssetDdId, this.exchange.baseAsset.code);
        this.setupAnchorDropDown(this._baseAnchorDdId, this.exchange.baseAsset.code, this.exchange.baseAsset.issuer);
        this.setupAssetCodesDropDown(this._counterAssetDdId, this.exchange.counterAsset.code);
        this.setupAnchorDropDown(this._counterAnchorDdId, this.exchange.counterAsset.code, this.exchange.counterAsset.issuer);
        this.updateTradeHistory();
        this.renderCandlestickChart(true);
    }

    /** Switch base and couter asset */
    swapAssets() {
        const url = "exchange/" + this.exchange.counterAsset.ToExchangeUrlParameter() + "/" +
                    this.exchange.baseAsset.ToExchangeUrlParameter() + "?"+GETParams.INTERVAL+"=" + this.chartInterval;
        this.router.navigateByUrl(url);
    }

    /** Set chart interval (i.e. 'size' of one candle) */
    setChartInterval(intervalDesc: string) {
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

        this.horizonService.getTradeAggregations(this.exchange, this.chartInterval, 70).subscribe(
        success => {
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
            const firstTimestamp = new Date(data._embedded.records[0].timestamp).getTime();
            if (firstTimestamp < rangeStart) {
                //Last trade is older than date range => we have no data
                this.dataStatus = DataStatus.NoData;
                this.chartMessage = `No trades in last ${chartRangeInDays} days`;
                return;
            }

            this.chartMessage = "";
            let minPrice = Number.MAX_VALUE;
            let maxPrice = -1.0;
            let maxVolume = -1.0;
            let globalOpen = -1.0;
            let globalClose = -1.0
            let volumeSum = 0.0;

            //Collect data for a single candle in the candlestick chart
            for (let record of data._embedded.records) {
                if (record.timestamp < rangeStart) {
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
                const candle = [record.timestamp, [open, high, low, close]];      //BUG: Horizon seems to have open and closed messed sometimes

                //Collect data for bar chart with volume
                const volume = parseFloat(record.base_volume);
                if (volume > maxVolume) {
                    maxVolume = volume;
                }
                volumeSum += volume;
                const volumeBar = [record.timestamp, volume];
                chartData.addCandleData(candle, volumeBar);
                chartData.setStartTime(record.timestamp);
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
        error => {
            const errorResponse = error as HttpErrorResponse;
            this.chartMessage = "Couldn't load data for this exchange (server: " +
                                errorResponse.error.detail + " - " + errorResponse.statusText + " [" + errorResponse.status + "])";
            this.dataStatus = DataStatus.Error;
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

    initChartStream() {
        if (!this._isActive)
        {
            //Cancel the loop if user navigated away
            return;
        }
        this.renderCandlestickChart(false);

        setTimeout(() => {
            this.initChartStream();
        }, Constants.CHART_INTERVAL);
    }
    /****************************** Trade history (right side panel) ******************************/
    private updateTradeHistory() {
        this.horizonService.getTradeHistory(this.exchange, 40).subscribe(
        success => {
            const data = success as any;

            this.tradeHistory = new Array<ExecutedTrade>();
            if (data._embedded.records.length === 0) {
                this.titleService.setTitle(this.exchange.baseAsset.code + "/" + this.exchange.counterAsset.code);
                this.lastPrice = 0.0;
                this.lastTradeType = "";
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

                for(let record of data._embedded.records) {
                    if (record.timestamp < rangeStart) {
                        break;    //Break at first value older than range start
                    }
                    const sellPrice = record.price.n / record.price.d;
                    const amount = parseFloat(record.base_amount);
                    const time = new Date(record.ledger_close_time);
                    const tradeType = record.base_is_seller ? "buy" : "sell";
                    this.tradeHistory.push(new ExecutedTrade(time, tradeType, sellPrice, amount, record.base_account, record.counter_account));
                }
            }
        },
        error => {
            const errorResponse = error as HttpErrorResponse;
            const message = "Couldn't load trade history for this exchange (server: " +
                            errorResponse.error.detail + " - " + errorResponse.statusText + " [" + errorResponse.status + "])";
            console.log(message);
            this.dataStatus = DataStatus.Error;
            this.lastPrice = -1;
            this.lastTradeType = "error";
        });
    }

    private initPastTradesStream() {
        if (!this._isActive)
        {
            //Cancel the loop if user navigated away
            return;
        }
        this.updateTradeHistory();

        setTimeout(() => {
            this.initPastTradesStream();
        }, ExchangeComponent.PAST_TRADES_INTERVAL);
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
        return this.exchange.baseAsset.code + "/" + this.exchange.counterAsset.code + " - " + Utils.formatPrice(sellPrice);
    }


    private setupAssetCodesDropDown(dropDownId: string, selectedAssetCode: string) {
        //In case this is re-init, destroy previous instance
        jQuery('div[id^="' + dropDownId + '"]').ddslick('destroy');

        const assetList: object[] = new Array();
        let found: boolean = false;
        this.assetService.getAssetCodesForExchange().forEach(function(assetCode){
            //Search for asset full name among know assets
            let assetFullName: string = assetCode + " (custom)";
            for (let asset in KnownAssets) {
                if (KnownAssets[asset].code === assetCode) {
                    assetFullName = KnownAssets[asset].fullName;
                    break;
                }
            }
            if (assetCode === selectedAssetCode) {
                found = true;
            }

            assetList.push({
                text: assetCode,
                value: assetCode,
                selected: assetCode === selectedAssetCode,
                description: assetFullName,
                imageSrc: "./assets/images/asset_icons/" + assetCode + ".png"
            });
        });

        //Some unknown code
        if (!found) {
            assetList.splice(0, 0, {    //Insert at beginning
                text: selectedAssetCode,
                value: selectedAssetCode,
                selected: true,
                description: selectedAssetCode + " (custom)",
                imageSrc: "./assets/images/asset_icons/" + selectedAssetCode + ".png"   //In case we don't have it, web serice is configured to return unknown.png as 404
            });
        }

        assetList.push({
            text: "[+] Add",
            value: "ADD_CUSTOM",
            description: "Add asset manually"
        });

        const that = this;
        jQuery("#" + dropDownId).ddslick({
            data: assetList,
            width: 150,
            onSelected: function (data) {
                if ("ADD_CUSTOM"  === data.selectedData.value) {
                    that.router.navigateByUrl(Constants.CONFIGURATION_URL);
                }
                else {
                    that.changeAssets(false);
                }
            }
        });
    }

    private setupAnchorDropDown(dropDownId: string, assetCode: string, assetIssuer: Account) {
        //In case this is re-init, destroy previous instance
        jQuery('div[id^="' + dropDownId + '"]').ddslick('destroy');
        const issuersArray = this.assetService.GetIssuersByAssetCode(assetCode);
        const issuerAccount = this.assetService.GetIssuerByAddress(assetIssuer.address);
        const assetIssuersDdData = new Array();
        let found = assetIssuer.IsNativeIssuer();
        for (let i=0; i<issuersArray.length; i++) {
            assetIssuersDdData.push({
                text: issuersArray[i].shortName,
                description: issuersArray[i].domain,
                value: issuersArray[i].address,
                selected: null != issuerAccount && issuersArray[i].address === issuerAccount.address
            });
            if (null != issuerAccount && issuersArray[i].address === issuerAccount.address) {
                found = true;
            }
        }

        //Some unknown address, probably from manual URL
        if (!found) {
            assetIssuersDdData.splice(0, 0, {    //Insert at beginning
                text: assetIssuer.shortName,
                description: "unknown (" + assetIssuer.address + ")",
                value: assetIssuer.address,
                selected: true
            });
        }

        if (null == issuerAccount || !issuerAccount.IsNativeIssuer()) {  //No need to manage XLM 'anchor'
            assetIssuersDdData.push({
                text: "[+] Manage",
                value: "ADD_CUSTOM",
                description: "Add anchor manually"
            });
        }

        const that = this;
        jQuery("#" + dropDownId).ddslick({
            data: assetIssuersDdData,
            width: 250,
            onSelected: function (data) {
                if ("ADD_CUSTOM"  === data.selectedData.value) {
                    const url = Constants.CONFIGURATION_URL + ";" + GETParams.ASSET_TYPE + "=" + assetCode;
                    that.router.navigateByUrl(url);
                }
                else {
                    that.changeAssets(true);
                }
            }
        });
    }

    /** After changing one of the asset drop-downs, compose respective exchange URL and navigate there. */
    private changeAssets(selectingAnchor) {
        let urlAssets = $('div[id^="' + this._baseAssetDdId + '"]').data('ddslick').selectedData.value;
        if (selectingAnchor) {
            const baseIssuer = $('div[id^="' + this._baseAnchorDdId + '"]').data('ddslick').selectedData.value;
            if (baseIssuer != null) {
                urlAssets += "-" + baseIssuer;
            }
        }

        urlAssets += "/" + $('div[id^="' + this._counterAssetDdId + '"]').data('ddslick').selectedData.value;
        if (selectingAnchor) {
            const counterIssuer = $('div[id^="' + this._counterAnchorDdId + '"]').data('ddslick').selectedData.value;
            if (counterIssuer != null) {
                urlAssets += "-" + counterIssuer;
            }
        }

        let newUrl = "exchange/" + urlAssets + "?"+GETParams.INTERVAL+"=" + this.chartInterval;
        this.router.navigateByUrl(newUrl);
    }
}
