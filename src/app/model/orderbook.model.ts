export class Orderbook {
    readonly bids: Offer[] = new Array<Offer>();
    readonly asks: Offer[] = new Array<Offer>();
}

export class Offer {
    readonly cumulativePercentage: number;

    constructor(public readonly price: number, public readonly amount: number, public readonly cummulativeAmount: number,
                public readonly isCrossLinked: boolean = false) { }
}
