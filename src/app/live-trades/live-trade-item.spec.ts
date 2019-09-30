import { HorizonRestServiceStub } from "./live-trades.component.spec";
import { LiveTradeItem } from "./live-trade-item";


describe("LiveTradeItem", () => {
    it("should create instance with correct properties", () => {
        const item = new LiveTradeItem(new HorizonRestServiceStub().fakeTrades[0], true);
        expect(item.actionName).toBe("Sold ");
        expect(item.linkText).toBe("1 XLM for 3 ASDF");
        expect(item.linkHref).toBe("/exchange/XLM/ASDF-GASDF");
        expect(item.note).toBe(" (price 0.0081 ASDF)");
        expect(item.isEven).toBe(true)
    });
});
