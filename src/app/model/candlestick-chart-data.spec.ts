import { CandlestickChartData } from "./candlestick-chart-data";


describe("CandlestickChartData (model)", () => {
  const chartData = new CandlestickChartData("ZEC");

  it("creates instance with correct Y label", () => {
    expect(chartData.getData()["scale-y"].label.text).toBe("Price (ZEC)");
  });
  it("#addCandleData() works", () => {
    chartData.addCandleData([new Object(123456789), [11.03, 13, -3, 10.0009]], [123456789, 145777]);
    expect(chartData.getData()["series"][0].values).toEqual([ [123456789, [11.03, 13, -3, 10.0009]] ]);
    expect(chartData.getData()["series"][1].values).toEqual([ [123456789, 145777] ]);
  });
  it("#setStartTime() sets chart's start point", () => {
    chartData.setStartTime(909090909);
    expect(chartData.getData()["scale-x"]["min-value"]).toBe(909090909);
  });
  it("#setCandleSize() sets interval length", () => {
    chartData.setCandleSize(3600000);
    expect(chartData.getData()["scale-x"].step).toBe("3600000");
  });
  it("#setPriceScale() sets correct values", () => {
    chartData.setPriceScale(-0.01, 5);
    const data = chartData.getData();
    expect(data["scale-y"]["min-value"]).toBe(0.0);
    expect(data["scale-y"]["max-value"]).toBe(6.2524999999999995);
    expect(data["scale-y"]["step"]).toBe(0.8932142857142856);
    expect(data["scale-y"]["decimals"]).toBe(3);
  });
  it("#setPriceScale() sets correct values when min and max price are equal", () => {
    chartData.setPriceScale(5322.11, 5322.11);
    const data = chartData.getData();
    expect(data["scale-y"]["min-value"]).toBe(5308.804725);
    expect(data["scale-y"]["max-value"]).toBe(5335.415274999999);
  });
  it("#setVolumeDecimals(4)", () => {
    chartData.setVolumeDecimals(4);
    expect(chartData.getData().series[1]["guide-label"].decimals).toBe(4);
  });
  it("#setVolumeScale(99) sets 0:99.000:33.000", () => {
    chartData.setVolumeScale(99);
    expect(chartData.getData()["scale-y-2"].values).toBe("0:99.000:33.000");
  });
});
