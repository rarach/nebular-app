import { HorizonRestServiceStub } from "./live-trades.component.spec";
import { LiveTradeItem } from "./live-trade-item";
import { Trade } from "../model/trade.model";


describe("LiveTradeItem", () => {
    it("should create instance with correct properties", () => {
        const item = new LiveTradeItem(new HorizonRestServiceStub().fakeTrades[0], true);
        expect(item.actionName).toBe("Sold ");
        expect(item.linkText).toBe("1 XLM for 3 ASDF");
        expect(item.linkHref).toBe("/exchange/XLM/ASDF-GASDF");
        expect(item.note).toBe(" (price 0.0081 ASDF)");
        expect(item.isEven).toBe(true);
    });

    it("should create instance with counter_asset_code defaulting to XLM if it's null", () => {
        const trade: Trade = {
            id: "trade-01",
            base_is_seller: false,
            base_asset_type: "alphanum4",
            base_asset_code: "NGN",
            base_asset_issuer: "GDDExchange",
            base_amount: "422.0",
            counter_asset_type: null,
            counter_asset_code: null,
            counter_amount: "16522.1007",
            price: { n: 1, d: 707.0707 }
        };
        const item = new LiveTradeItem(trade, false);
        expect(item.actionName).toBe("Bought ");
        expect(item.linkText).toBe("422 NGN for 16522.101 XLM");
        expect(item.linkHref).toBe("/exchange/NGN-GDDExchange/XLM");
        expect(item.note).toBe(" (price 0.001414 XLM)");
        expect(item.isEven).toBe(false);
    });
});
