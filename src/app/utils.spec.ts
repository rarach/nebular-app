import { TestBed } from '@angular/core/testing';
import { Utils } from './utils';


describe('Utils', () => {
    it('#getPrecisionDecimals(-4444) returns 3', () => {
        expect(Utils.getPrecisionDecimals(-4444)).toBe(3);
    });
    it('#getPrecisionDecimals(0) returns 3', () => {
        expect(Utils.getPrecisionDecimals(0)).toBe(3);
    });
    it('#getPrecisionDecimals(0.000070000) returns 8', () => {
        expect(Utils.getPrecisionDecimals(0.000070000)).toBe(8);
    });
    it('#getPrecisionDecimals(0.02) returns 5', () => {
        expect(Utils.getPrecisionDecimals(0.02)).toBe(5);
    });
    it('#getPrecisionDecimals(555888999444) returns 3', () => {
        expect(Utils.getPrecisionDecimals(555888999444)).toBe(3);
    });

    it('#intervalAsMilliseconds(["300000", "5min", "5m"]) returns 300000', () => {
        expect(Utils.intervalAsMilliseconds("300000")).toBe(300000);
        expect(Utils.intervalAsMilliseconds("5min")).toBe(300000);
        expect(Utils.intervalAsMilliseconds("5m")).toBe(300000);
    });
    it('#intervalAsMilliseconds(["900000", "15min", "15m"]) returns 900000', () => {
        expect(Utils.intervalAsMilliseconds("900000")).toBe(900000);
        expect(Utils.intervalAsMilliseconds("15min")).toBe(900000);
        expect(Utils.intervalAsMilliseconds("15m")).toBe(900000);
    });
    it('#intervalAsMilliseconds(["3600000", "1hour", "1h", "60m"...]) returns 3600000', () => {
        expect(Utils.intervalAsMilliseconds("3600000")).toBe(3600000);
        expect(Utils.intervalAsMilliseconds("hour")).toBe(3600000);
        expect(Utils.intervalAsMilliseconds("1h")).toBe(3600000);
        expect(Utils.intervalAsMilliseconds("60min")).toBe(3600000);
        expect(Utils.intervalAsMilliseconds("60m")).toBe(3600000);
    });
    it('#intervalAsMilliseconds(["86400000", "day", "24h"...]) returns 86400000', () => {
        expect(Utils.intervalAsMilliseconds("86400000")).toBe(86400000);
        expect(Utils.intervalAsMilliseconds("day")).toBe(86400000);
        expect(Utils.intervalAsMilliseconds("1decade")).toBe(86400000);
        expect(Utils.intervalAsMilliseconds("1d")).toBe(86400000);
        expect(Utils.intervalAsMilliseconds("24h")).toBe(86400000);
    });
    it('#intervalAsMilliseconds(["604800000", "week", "1w"...]) returns 604800000', () => {
        expect(Utils.intervalAsMilliseconds("604800000")).toBe(604800000);
        expect(Utils.intervalAsMilliseconds("week")).toBe(604800000);
        expect(Utils.intervalAsMilliseconds("1w")).toBe(604800000);
        expect(Utils.intervalAsMilliseconds("1weekend")).toBe(604800000);
        expect(Utils.intervalAsMilliseconds("7d")).toBe(604800000);
    });
    it('#intervalAsMilliseconds([null, "nonesense"]) defaults to 900000', () => {
        expect(Utils.intervalAsMilliseconds("2 days")).toBe(900000);
        expect(Utils.intervalAsMilliseconds(null)).toBe(900000);
    });

    it('#formatAmount(12345.001) gives "12345.001"', () => {
        expect(Utils.formatAmount(12345.001)).toBe("12345.001");
    });
    it('#formatAmount(750000) gives "750000"', () => {
        expect(Utils.formatAmount(750000)).toBe("750000");
    });
    it('#formatAmount(55.0000002) gives "55"', () => {
        expect(Utils.formatAmount(55.0000002)).toBe("55");
    });
    it('#formatAmount(0.00000071000000) gives "0.00000071"', () => {
        expect(Utils.formatAmount(0.00000071000000)).toBe("0.00000071");
    });
    it('#formatPrice(1.0) gives "1"', () => {
        expect(Utils.formatPrice(1.0)).toBe("1");
    });
});
