import { Orderbook, Offer } from "./orderbook.model";

describe('Orderbook (model)', () => {
    it("should create instance", () => {
        const orderbook = new Orderbook();
        expect(orderbook.asks.length).toBe(0);
    });
    it("adds new Offer (also model)", () => {
        const offer = new Offer(123.456, 1000, 489222.0009, false);
        expect(offer.price).toBe(123.456);
        expect(offer.cummulativeAmount).toBe(489222.0009);
        expect(offer.isCrossLinked).toBe(false);
        const orderbook = new Orderbook();
        orderbook.bids.push(offer);
        expect(orderbook.asks.length).toBe(0);
        expect(orderbook.bids.length).toBe(1);
    });
});