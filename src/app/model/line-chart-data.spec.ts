import { LineChartData } from "./line-chart-data";


describe("CandlestickChartData (model)", () => {
    const chartData = new LineChartData();

    it("#clearData() clears market data", () => {
        chartData.clearData();  //NOTE: otherwise it could interfere with below test
        expect(chartData.DataPointCount()).toBe(0);
        chartData.addPointData([1.0, 1.05, 3.0]);
        expect(chartData.getData()["series"][0].values.length).toBe(1);
        chartData.clearData();
        expect(chartData.getData()["series"][0].values.length).toBe(0);
    });
    it("#addPointData() adds data point", () => {
        chartData.clearData();  //NOTE: otherwise it could interfere with above test
        chartData.addPointData([123456789, 52.677]);
        chartData.addPointData([123456991, 59.0407]);
        expect(chartData.getData()['series'][0].values).toEqual([
            [123456789, 52.677],
            [123456991, 59.0407]
        ]);
    });
    it("#setStartTime() sets chart starting time", () => {
        chartData.setStartTime(536536536536);
        expect(chartData.getData()["scale-x"]["min-value"]).toBe(536536536536);
    });
    it("#setPriceScale() sets chart boundaries", () => {
        chartData.setPriceScale(10, 20);
        expect(chartData.getData()["scale-y"]["min-value"]).toBe(9);
        expect(chartData.getData()["scale-y"]["max-value"]).toBe(20);
    });
    it("#setBackgroundColor('yellow')", () => {
        chartData.setBackgroundColor("yellow");
        expect(chartData.getData()["background-color"]).toBe("yellow");
    });
    it("#setLineColor('#f0f0f0')", () => {
        chartData.setLineColor("#f0f0f0");
        expect(chartData.getData()["series"][0]["line-color"]).toBe("#f0f0f0");
    });
    it("#contextMenuLink('www.google.com')", () => {
        chartData.contextMenuLink("www.google.com");
        expect(chartData.getData()['gui'].contextMenu.customItems[0]["function"]).toBe("openChartInNewTab('www.google.com')");
    });
});
