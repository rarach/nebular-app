import { Constants } from "./constants";
import { Utils } from "../utils";


export class CandlestickChartData {

    constructor(counterAssetCode: string) {
        this._configCandleSticks["scale-y"].label.text = "Price (" + counterAssetCode + ")";
    }


    /**
     * Add data of one candle for the chart
     * @param candle candle data in form [timestamp_as_millis, [open, high, low, close]]
     * @param volume volume data in form [timestamp_as_millis, volume]
     */
    addCandleData(candle: Array<object>, volume: Array<number>) {
        this._configCandleSticks.series[0].values.push(candle);
        this._configCandleSticks.series[1].values.push(volume);
    }

    /**
     * Specify beginning of X axis of this chart by giving timestamp of oldest candle.
     * @param timestamp timestamp of the first candle in ticks
     */
    setStartTime(timestamp: number) {
        this._configCandleSticks["scale-x"]["min-value"] = timestamp;
    }

    /**
     * Set resolution of X axis in milliseconds, i.e. how much time does one candle represent.
     * @param millisInCandle number of miliseconds in one candle
     */
    setCandleSize(millisInCandle: number) {
        this._configCandleSticks["scale-x"]["step"] = millisInCandle.toString();
    }

    /**
     * Set scope of the Y axis, i.e. price. The axis will be divided into up to 7 equal segments for visual guidance.
     * @param minPrice lower bound
     * @param maxPrice upper bound
     */
    setPriceScale(minPrice: number, maxPrice: number) {
        let diff = maxPrice - minPrice;
        if (diff === 0.0) {
            //One price throughout the whole chart - stretch it a bit
            diff = 0.01 * maxPrice;
        }
        minPrice = minPrice - 0.25*diff;    //Small space below the deepest candle
        if (minPrice < 0.0) {
            minPrice = 0.0;
        }
        maxPrice = maxPrice + 0.25*diff;    //Small space above the tallest candle

        const step = (maxPrice - minPrice) / 7.0;
        const decimals = Utils.getPrecisionDecimals(minPrice);
        this._configCandleSticks["scale-y"]["min-value"] = minPrice;
        this. _configCandleSticks["scale-y"]["max-value"] = maxPrice;
        this._configCandleSticks["scale-y"]["step"] = step;
        this._configCandleSticks["scale-y"]["decimals"] = decimals;
    }

    /**
     * Set precision of volume tooltips
     * @param decimals number of digits to be shown after decimal separator
     */
    setVolumeDecimals(decimals: number) {
        this._configCandleSticks.series[1]["guide-label"].decimals = decimals;
    }

    /** Set range of lower part of X axis (i.e. volume) by giving upper bound. */
    setVolumeScale(maxVolume: number) {
        const step = maxVolume / 3.0;
        this._configCandleSticks["scale-y-2"].values = "0:" + maxVolume.toFixed(3) + ":" + step.toFixed(3);
    }

    /** Get the chart data ready to be used by ZingChart */
    getData() {
        return this._configCandleSticks;
    }


    private _configCandleSticks = {
        "type": "mixed",
        "background-color": "none",
        "title":{
            "font-family": Constants.Style.FONT,
            "color":  Constants.Style.GRAY,
            "background-color": "none",
            "align": "left"
        },
        gui: {
            behaviors: [        //NOTE: the "About ZingChart" item cannot be removed until I buy their license
                {id:'ViewSource', enabled:'none'},
                {id:'Reload', enabled:'none'},
                {id:'SaveAsImage', enabled:'none'},
                {id:'DownloadPDF', enabled:'none'},
                {id:'DownloadSVG', enabled:'none'},
                {id:'DownloadXLS', enabled:'none'},
                {id:'Print', enabled:'none'},
                {id:'ViewSource', enabled:'none'},
                {id:'ViewDataTable', enabled:'none'},
                {id:'HideGuide', enabled:'none'}
            ]
        },
        "labels":[
            {
                "text":"open: %plot-0-value-0",
                "font-family": Constants.Style.FONT,
                "font-size": "13.5px",
                "color": Constants.Style.GRAY,
                "x":"5",
                "y":"25"
            },
            {
                "text":"high: %plot-0-value-1",
                "font-family": Constants.Style.FONT,
                "font-size": "13.5px",
                "color":  Constants.Style.GREEN,
                "x":"150",
                "y":"25"
            },
            {
                "text":"low: %plot-0-value-2",
                "font-family": Constants.Style.FONT,
                "font-size": "13.5px",
                "color":  Constants.Style.RED,
                "x":"295",
                "y":"25"
            },
            {
                "text":"close: %plot-0-value-3",
                "font-family": Constants.Style.FONT,
                "font-size": "13.5px",
                "color": Constants.Style.GRAY,
                "x":"435",
                "y":"25"
            },
            {
                "text":"volume: %plot-1-value",
                "font-family": Constants.Style.FONT,
                "font-size": "13.5px",
                "color": Constants.Style.GRAY,
                "x":"590",
                "y":"25"
            }
        ],
        "plot":{
            "aspect":"candlestick",
            "bar-width": "70%",
            "tooltip":{
                "visible":false
            }
        },
        "plotarea":{
            "margin-left":"10%"
        },
        "scale-x":{
            "min-value": 1438592400000,
            "step": "day",      //Candle size from input
            "transform": {
                "type": "date",
                "all": "%D,<br>%M %d"
            },
            "max-items": 10,
            "item": {
                "font-size": 10
            }
        },
        "crosshair-x":{
            "plot-label":{
                "multiple":true
            },
            "scale-label":{
                "text":"%v",
                "transform":{
                    "type":"date",
                    "all":"%H:%i<br>%D, %M %d, %Y"
                },
                "background-color": Constants.Style.GRAY
            }
        },
        "scale-y":{
            "offset-start": "30%", //to adjust scale offsets.
            "format": "%v",
            "label": {
                "text": "Price (ASDF)"
            },
            "guide":{
                "line-style":"solid"
            },
            "item":{
                "font-size":10
            }
        },
        "scale-y-2":{
            "placement": "default", //to move scale to default (left) side.
            "blended": true,        //to bind the scale to "scale-y".
            "offset-end": "85%",    //to adjust scale offsets.
            "values": "0:100:20",
            "format": "%v",
            "guide":{
                "line-style":"solid"
            },
            "item":{
                "font-size":10
            }
        },
        "series": [
            {
                "type":"stock",
                "scales": "scale-x,scale-y",
                "guide-label": {    //for crosshair plot labels
                    "visible": false
                },
                "trend-up":{
                    "line-color": Constants.Style.GREEN,
                    "border-color": Constants.Style.GREEN,
                    "background-color": Constants.Style.GREEN
                },
                "trend-down":{
                    "line-color": Constants.Style.RED,
                    "border-color": Constants.Style.RED,
                    "background-color": Constants.Style.RED
                },
                "values":[
                    /*e.g.                [1438592400000, [120.8800,	121.7300,	120.1700,	121.1200]], //08/03/15
                     [1438678800000, [121.5000,	122.0800,	120.6100,	121.6900]], //08/04/15
                     [1438765200000, [110.8300,	113.9500,	109.5000,	110.5300]], //08/05/15
                     [1438851600000, [110.4000,	110.4000,	104.2400,	108.5500]], //08/06/15
                     [1438938000000, [108.7500,	109.5598,	107.6600,	109.3500]], //08/07/15
                     */
                ]
            },
            {
                "type":"bar",
                "scales": "scale-x,scale-y-2",
                "guide-label": {    //for crosshair plot labels
                    "text": "Volume: %v",
                    "decimals": Constants.DEFAULT_AMOUNT_DECIMALS,
                    "background-color": Constants.Style.GRAY,
                    "color": "#FFFFFF"
                },
                "background-color": Constants.Style.GRAY,
                "values":[
                    /*e.g.                [1438592400000, 8.43], //08/03/15
                     [1438678800000, 12.62], //08/04/15
                     [1438765200000, 61.01], //08/05/15
                     [1438851600000, 57.18], //08/06/15
                     [1438938000000, 15.79], //08/07/15
                     */            ]
            }
        ]
    };
}
