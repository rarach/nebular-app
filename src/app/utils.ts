import { Constants } from "./model/constants";

export class Utils {
    /**
     * Get precision as number of decimal digits based on given amount or price
     * @param value amount or price to base the precision on
     */
    static getPrecisionDecimals(value: number): number {
        let decimals = 3;
        if (value <= 0.0) {
            return decimals;
        }
        while (value < 1.0) {
            value *= 10;
            decimals++;
        }
        return decimals;
    }

    /** "Translate" candle-stick chart interval from description to milliseconds */
    static intervalAsMilliseconds(intervalDesc: string): number {
        if ("300000" === intervalDesc || "5min" === intervalDesc || "5m" === intervalDesc) {
            return 300000;
        }
        if (!intervalDesc || "900000" === intervalDesc || "15min" === intervalDesc || "15m" === intervalDesc) {
            return 900000;
        }
        if ("3600000" === intervalDesc || "hour" === intervalDesc || 0 === intervalDesc.indexOf("1h") || "60min" === intervalDesc || "60m" === intervalDesc) {
            return 3600000;
        }
        if ("86400000" === intervalDesc || "day" === intervalDesc || 0 === intervalDesc.indexOf("1d") || intervalDesc.indexOf("24h") === 0) {
            return 86400000;
        }
        if ("604800000" === intervalDesc || "week" == intervalDesc || 0 === intervalDesc.indexOf("1w") || intervalDesc.indexOf("7d") === 0) {
            return 604800000;
        }

        //Default to 15 minutes
        return 900000;
    }

    static formatAmount(amount: number): string {
        const decimals: number = Utils.getPrecisionDecimals(amount);
        return Utils.formatNumber(amount, decimals);
    }

    static formatPrice(price: number): string {
        return this.formatAmount(price);
    }

    /** Compose valid URL to the Exchange page from given base/counter assets */
    static getExchangeUrl(baseAssetCode: string, baseIssuerAddress: string, counterAssetCode: string, counterIssuerAddress: string) {
        let url: string = Constants.EXCHANGE_URL + "/";
        url += (baseIssuerAddress ? baseAssetCode + "-" + baseIssuerAddress : Constants.NATIVE_ASSET_CODE);
        url += "/";
        url += (counterIssuerAddress ? counterAssetCode + "-" + counterIssuerAddress : Constants.NATIVE_ASSET_CODE);

        return url;
    }

    private static formatNumber(value: number, decimals: number): string {
        const numString: string = value.toFixed(decimals);
        return Utils.trimZeros(numString);
    }

    private static trimZeros(str: string): string {
        str = str.replace(/0{1,99}$/, '');  //Trim trailing zeros
        return str.replace(/\.$/, '');      //Replace possible trailing dot (if the number was whole)
    }
}
