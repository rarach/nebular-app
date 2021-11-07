export class ExecutedTrade {
    public readonly seller: string;
    public readonly buyer: string;
    public readonly isPoolTrade: boolean = false;

    constructor(public readonly time: Date,
                public readonly tradeType: string,
                public readonly price: number,
                public readonly amount: number,
                sellingAccount: string,
                buyingAccount: string,
                public isLastOfDay: boolean = false) {
        if (sellingAccount) {
            this.seller = sellingAccount.substring(0, 8) + '...' + sellingAccount.substring(48);
        }
        else {
            this.seller = '(liq. pool)';
            this.isPoolTrade = true;
        }

        if (buyingAccount) {
            this.buyer = buyingAccount.substring(0, 8) + '...' + buyingAccount.substring(48);
        }
        else {
            this.buyer = '(liq. pool)';
            this.isPoolTrade = true;
        }
    }
}
