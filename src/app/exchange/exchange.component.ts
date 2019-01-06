import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import zingchart from "zingchart";

import { Asset, KnownAssets } from '../model/asset.model';
import { AssetService } from '../services/asset.service';
import { CandlestickChartData } from '../model/candlestick-chart-data';
import { Constants, GETParams } from '../model/constants';
import { DataStatus } from '../model/data-status.enum';
import { DropdownOption } from '../model/dropdown-option';
import { ExchangePair } from '../model/exchange-pair.model';
import { ExecutedTrade } from '../model/executed-trade.model';
import { HorizonRestService } from '../services/horizon-rest.service';
import { Utils } from '../utils';


@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, OnDestroy {
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

    assetCodeOptions: DropdownOption[] = [];
    selectedBaseAssetCode: DropdownOption = null;
    selectedCounterAssetCode: DropdownOption = null;
    baseIssuerOptions: DropdownOption[] = [];
    counterIssuerOptions: DropdownOption[] = []
    selectedBaseIssuer: DropdownOption = null;
    selectedCounterIssuer: DropdownOption = null;


    constructor(private route: ActivatedRoute, private router: Router, private titleService: Title,
                private assetService: AssetService, private horizonService: HorizonRestService) {
        this.loadAssetCodes();
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
        //Set selected option in base asset code drop-down
        let baseCodeDdOption: DropdownOption = null;
        for (let option of this.assetCodeOptions) {
            if (option.value === this.exchange.baseAsset.code) {
                baseCodeDdOption = option;
                break;
            }
        }
        this.selectedBaseAssetCode = baseCodeDdOption;
        //and counter code drop-down
        let counCodeDdOption: DropdownOption = null;
        for (let option of this.assetCodeOptions) {
            if (option.value === this.exchange.counterAsset.code) {
                counCodeDdOption = option;
                break;
            }
        }
        this.selectedCounterAssetCode = counCodeDdOption;

        this.loadBaseIssuers();
        this.loadCounterIssuers();

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

    /*********************************** Asset code/issuer drop-downs ***********************************/

    /** Load available asset codes for the drop-downs */
    private loadAssetCodes() {
        for (let assetCode of this.assetService.getAssetCodesForExchange()) {
            //Search for asset full name among know assets
            let assetFullName: string = assetCode + " (custom)";
            for (let asset in KnownAssets) {
                if (KnownAssets[asset].code === assetCode) {
                    assetFullName = KnownAssets[asset].fullName;
                    break;
                }
            }

            this.assetCodeOptions.push(
                new DropdownOption(assetCode, assetCode, assetFullName)
            );
        }

        this.assetCodeOptions.push(new DropdownOption("ADD_CUSTOM", "[+] Add", "Add asset manually"));
    }

    /** Load list of valid anchors for selected base/counter asset codes */
    private loadBaseIssuers() {
        this.baseIssuerOptions = [];
        const issuersArray = this.assetService.GetIssuersByAssetCode(this.exchange.baseAsset.code);
        const issuerAccount = this.assetService.GetIssuerByAddress(this.exchange.baseAsset.issuer.address);
        let found = this.exchange.baseAsset.issuer.IsNativeIssuer();
        for (let i=0; i<issuersArray.length; i++) {
            const ddOption = new DropdownOption(issuersArray[i].address, issuersArray[i].domain, issuersArray[i].shortName);
            this.baseIssuerOptions.push(ddOption);
            //By default, pre-select the first option
            if (0 === i) {
                this.selectedBaseIssuer = ddOption;
            }
            if (null != issuerAccount && issuersArray[i].address === issuerAccount.address) {
                found = true;
                this.selectedBaseIssuer = ddOption;
            }
        }

        //Some unknown address, probably from manual URL
        if (!found) {
            //Insert at the beginning
            const ddOption = new DropdownOption(this.exchange.baseAsset.issuer.address, "", "unknown (" + this.exchange.baseAsset.issuer.address + ")");
            this.baseIssuerOptions.splice(0, 0, ddOption);
            this.selectedBaseIssuer = ddOption;
        }

        if (null == issuerAccount || !issuerAccount.IsNativeIssuer()) {  //No need to manage XLM 'anchor'
            this.baseIssuerOptions.push(new DropdownOption("ADD_CUSTOM", "[+] Manage", "Add anchor manually"));
        }
    }

    private loadCounterIssuers() {
        this.counterIssuerOptions = [];
        const issuersArray = this.assetService.GetIssuersByAssetCode(this.exchange.counterAsset.code);
        const issuerAccount = this.assetService.GetIssuerByAddress(this.exchange.counterAsset.issuer.address);
        let found = this.exchange.counterAsset.issuer.IsNativeIssuer();
        for (let i=0; i<issuersArray.length; i++) {
            const ddOption = new DropdownOption(issuersArray[i].address, issuersArray[i].domain, issuersArray[i].shortName);
            this.counterIssuerOptions.push(ddOption);
            //By default, pre-select the first option
            if (0 === i) {
                this.selectedCounterIssuer = ddOption;
            }
            if (null != issuerAccount && issuersArray[i].address === issuerAccount.address) {
                found = true;
                this.selectedCounterIssuer = ddOption;
            }
        }

        //Some unknown address, probably from manual URL
        if (!found) {
            //Insert at the beginning
            const ddOption = new DropdownOption(this.exchange.counterAsset.issuer.address, "", "unknown (" + this.exchange.counterAsset.issuer.address + ")");
            this.counterIssuerOptions.splice(0, 0, ddOption);
            this.selectedCounterIssuer = ddOption;
        }

        if (null == issuerAccount || !issuerAccount.IsNativeIssuer()) {  //No need to manage XLM 'anchor'
            this.counterIssuerOptions.push(new DropdownOption("ADD_CUSTOM", "[+] Manage", "Add anchor manually"));
        }
    }

    
    baseAssetCodeChanged(event) {
        if ("ADD_CUSTOM" === this.selectedBaseAssetCode.value) {
            this.router.navigateByUrl(Constants.CONFIGURATION_URL);
        }
        else {
            this.changeBaseAsset(false);
        }
    }

    counterAssetCodeChanged(event) {
        if ("ADD_CUSTOM" == this.selectedCounterAssetCode.value) {
            this.router.navigateByUrl(Constants.CONFIGURATION_URL);
        }
        else {
            this.changeCounterAsset(false);
        }
    }

    issuerChanged(event) {
        if ("ADD_CUSTOM"  === this.selectedBaseIssuer.value) {
            const url = Constants.CONFIGURATION_URL + ";" + GETParams.ASSET_TYPE + "=" + this.selectedBaseAssetCode.value;
            this.router.navigateByUrl(url);
        }
        else if ("ADD_CUSTOM" === this.selectedCounterIssuer.value) {
            const url = Constants.CONFIGURATION_URL + ";" + GETParams.ASSET_TYPE + "=" + this.selectedCounterAssetCode.value;
            this.router.navigateByUrl(url);
        }
        else {
            //NOTE: it doesn't really matter whether we use base or counter drop-down here
            this.changeBaseAsset(true);
        }
    }

    /** After changing the base asset drop-down, compose respective exchange URL and navigate there. */
    private changeBaseAsset(selectingAnchor: boolean) {
        let urlAssets: string = this.selectedBaseAssetCode.value;
        if (selectingAnchor) {
            if (this.selectedBaseIssuer != null && this.selectedBaseIssuer.value != null) {
                urlAssets += "-" + this.selectedBaseIssuer.value;
            }
        }

        urlAssets += "/" + this.selectedCounterAssetCode.value;
        if (this.selectedCounterIssuer != null && this.selectedCounterIssuer.value != null) {
            urlAssets += "-" + this.selectedCounterIssuer.value;
        }

        let newUrl = "exchange/" + urlAssets + "?"+GETParams.INTERVAL+"=" + this.chartInterval;
        this.router.navigateByUrl(newUrl);
    }

    private changeCounterAsset(selectingAnchor: boolean) {
        let urlAssets: string = this.selectedBaseAssetCode.value;
        if (this.selectedBaseIssuer != null && this.selectedBaseIssuer.value != null) {
            urlAssets += "-" + this.selectedBaseIssuer.value;
        }

        urlAssets += "/" + this.selectedCounterAssetCode.value;
        if (selectingAnchor) {
            if (this.selectedCounterIssuer != null && this.selectedCounterIssuer.value != null) {
                urlAssets += "-" + this.selectedCounterIssuer.value;
            }
        }

        let newUrl = "exchange/" + urlAssets + "?"+GETParams.INTERVAL+"=" + this.chartInterval;
        this.router.navigateByUrl(newUrl);
    }
    /**********************************************************************************************/
}
