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
        if ("3600000" === intervalDesc || "hour" === intervalDesc || "1hour" === intervalDesc || "60min" === intervalDesc || "60m" === intervalDesc) {
            return 3600000;
        }
        if ("86400000" === intervalDesc || "day" === intervalDesc || "1day" === intervalDesc || "1d" === intervalDesc || intervalDesc.indexOf("24h") === 0) {
            return 86400000;
        }
        if ("604800000" === intervalDesc || "week" == intervalDesc || "1week" === intervalDesc || "1w" === intervalDesc || intervalDesc.indexOf("7d") === 0) {
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
        const decimals: number = Utils.getPrecisionDecimals(price);
        return Utils.formatNumber(price, decimals);
    }
    
    private static formatNumber(value: number, decimals: number): string {
        const numString: string = decimals ? value.toFixed(decimals) : value.toString();
        return Utils.trimZeros(numString);
    }

    private static trimZeros(str: string): string {
        if (str.indexOf('.') <= -1) {
            return str;
        }
        str = str.replace(/0{1,99}$/, '');  //Trim trailing zeros
        return str.replace(/\.$/, '');      //Replace possible trailing dot (if the number was whole)
    }
}
