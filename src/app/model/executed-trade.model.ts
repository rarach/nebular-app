export class ExecutedTrade {
    constructor(public readonly time: Date, public readonly price: number, public readonly amount: number,
                public readonly sellingAccount: string, public readonly buyingAccount: string) {
    }
}
