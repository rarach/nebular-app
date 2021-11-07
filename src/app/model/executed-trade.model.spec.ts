import { ExecutedTrade } from "./executed-trade.model";

describe("ExecutedTrade (model)", () => {

    it("creates instance with standard buyer and seller", () => {
        const trade = new ExecutedTrade(new Date(585558555555), "buy", 123.456, 0.001,
                                        'GCCCCCCCCsomebodyWTGHADSFWAGREFDSEFSDASDFAWTQRFFSITITITI',
                                        'GDPRRTJDRHSFGZAAAXT0000000000000000000000GWSRDUIYJFHSGDH');
        expect(trade.time.getFullYear()).toBe(1988);
        expect(trade.tradeType).toBe("buy");
        expect(trade.price).toBe(123.456);
        expect(trade.amount).toBe(0.001);
        expect(trade.seller).toBe("GCCCCCCC...SITITITI");
        expect(trade.buyer).toBe("GDPRRTJD...YJFHSGDH");
        expect(trade.isPoolTrade).toBeFalse();
    });

    it("creates instance with liquidity pool as seller", () => {
        const trade = new ExecutedTrade(new Date(1627578655555), 'sell', 18.04, 555.0,
                                        undefined,
                                        'GDPRRTJDRHSFGZAAAXT0000000000000000000000GWSRDUIYJFHSGDH');
        expect(trade.time.getFullYear()).toBe(2021);
        expect(trade.tradeType).toBe('sell');
        expect(trade.price).toBe(18.04);
        expect(trade.amount).toBe(555);
        expect(trade.seller).toBe('(liq. pool)');
        expect(trade.buyer).toBe('GDPRRTJD...YJFHSGDH');
        expect(trade.isPoolTrade).toBeTrue();
    });
});
