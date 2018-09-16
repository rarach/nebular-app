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
}
