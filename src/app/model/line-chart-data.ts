import { Constants } from "./constants";


/**
 * View-model to simple line chart of historical trades for past 24 hours. Uses ZingChart to draw SVG.
 */
export class LineChartData {
  constructor(){}


  /** @public Delete all data of this chart. Should be called before updating with new data. */
  clearData() {
    this._chartConfig.series[0].values = [];
  }

  /** Returns the object to be used as ZingChart configuration and data */
  getData(): Object {
    return this._chartConfig;
  }

  /** @public Add data for one point in the chart, i.e. timestamp and price */
  addPointData(point: Array<number>) {
    this._chartConfig.series[0].values.push(point);
  }

  /**
     * Returns number of points to be rendered in this chart
     * @returns number of points in this chart
     */
  DataPointCount(): number {
    return this._chartConfig.series[0].values.length;
  }

  /**
     * Specify beginning of X axis of this chart by giving timestamp of oldest candle.
     * @param timestamp timestamp of the first candle in ticks
     */
  setStartTime(timestamp: number) {
    this._chartConfig["scale-x"]["min-value"] = timestamp;
  }

  /**
     * Set scope of the Y axis, i.e. price. The axis will be divided into up to 5 equal segments for visual guidance.
     * @param minPrice lower bound
     * @param maxPrice upper bound
     */
  setPriceScale(minPrice: number, maxPrice: number) {
    const diff = maxPrice - minPrice;
    minPrice = minPrice - 0.1*diff;     //10% bottom offset so it doesn't sit on X axis

    this._chartConfig["scale-y"]["min-value"] = minPrice;
    this._chartConfig["scale-y"]["max-value"] = maxPrice;
    //NOTE: we don't set "step" here and leave ZingChart figure it out. Doing it ourselves led to the chart randomly shift vertically (ZingChart bug?)
    //const step = (maxPrice - minPrice) / 5.0;
  }

  /**
     * Set background color of this chart. Usually used to indicate raising/falling market.
     * @param color CSS style color name or color code
     */
  setBackgroundColor(color: string) {
    this._chartConfig["background-color"] = color;
  }

  /**
     * Set line color. Usually used to emphasize rising/falling trend.
     * @param color CSS style color name of color code
     */
  setLineColor(color: string) {
    this._chartConfig.series[0]["line-color"] = color;
  }

  /** URL to be opened when user clicks the context menu item "Open in new tab" */
  contextMenuLink(url: string) {
    this._chartConfig.gui.contextMenu.customItems[0]["function"] = "openChartInNewTab('" + url + "')";
  }


  private readonly _chartConfig =
    {
      "type": "line",
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
        ],
        contextMenu: {
          customItems:[
            {
              text:"Open in new tab",
              "function": "(set dynmically)"
            }
          ]
        }
      },
      "utc": false,
      "plotarea": {
        "margin": "dynamic 30 60 dynamic"
      },
      "scale-x": {
        "line-color": Constants.Style.GRAY,
        "min-value": 1383292800000, //Dummy. Real value is set before rendering
        "step": 900000,     //constant 15min interval
        "transform": {
          "type": "date",
          "all": "%h %A"
        },
        "max-labels": 6         //In fact 'min'
      },
      "scale-y": {
        "line-color": Constants.Style.GRAY,
        "guide": {
          "line-style": "dashed",
          "line-color": "#C5C5C5"
        },
        "thousands-separator": ","
      },
      "tooltip": {
        "visible": false
      },
      "plot": {
        "line-width": "4px",
        "marker": {
          "visible": false
        }
      },
      "series": [
        {
          "values": [
            /*e.g.                [1438592400000, 8.43], //08/03/15
                        [1438678800000, 12.62], //08/04/15
                        [1438765200000, 61.01], //08/05/15
                        [1438851600000, 57.18], //08/06/15
                        [1438938000000, 15.79], //08/07/15
                        */
          ],
          "cursor": "pointer"
        }
      ]
    };
}
