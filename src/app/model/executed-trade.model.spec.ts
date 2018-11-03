import { ExecutedTrade } from "./executed-trade.model";

describe("ExecutedTrade (model)", () => {

    it("creates instance", () => {
        const trade = new ExecutedTrade(new Date(585558555555), "buy", 123.456, 0.001, "GCCCCCCCCsomebody", "GDPRRTJDRHSFGZ");
        expect(trade.time.getFullYear()).toBe(1988);
        expect(trade.tradeType).toBe("buy");
        expect(trade.price).toBe(123.456);
        expect(trade.amount).toBe(0.001);
        expect(trade.sellingAccount).toBe("GCCCCCCCCsomebody");
        expect(trade.buyingAccount).toBe("GDPRRTJDRHSFGZ");
    });
});
