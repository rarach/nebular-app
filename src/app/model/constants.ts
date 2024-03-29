export class Constants {
  static readonly CONFIGURATION_URL: string = "/configuration";
  static readonly EXCHANGE_URL: string = "/exchange";
  static readonly ORDERBOOK_INTERVAL: number = 7000;
  static readonly CHART_INTERVAL: number = 8 * 60 * 1000;
  static readonly NATIVE_ASSET_CODE: string = "XLM";
  static readonly NATIVE_ASSET_TYPE: string = "native";
  static readonly NATIVE_ASSET_IMAGE: string = "./assets/images/asset_icons/XLM.png";
  static readonly UNKNOWN_ASSET_IMAGE: string = "./assets/images/asset_icons/unknown.png";
  static readonly DEFAULT_AMOUNT_DECIMALS: number = 4;
  static readonly Style = {
    FONT: 'consolas,"Liberation Mono",courier,monospace',
    GREEN: "#46B446",
    RED: "#ED8117",
    LIGHT_GREEN: "#C8E8C8",
    LIGHT_RED: "#FAD9B9",
    GRAY: "#5B6A72"
  }
}

export class GETParams {
  static readonly INTERVAL: string = "interval";
}
