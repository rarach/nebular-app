import { Constants } from "../model/constants";
import { Trade } from "../model/trade.model";
import { Utils } from "../utils";


export class LiveTradeItem {
    public actionName: string;
    public linkText: string;
    public linkHref: string;
    public note: string;

    private baseAmount: number;
    private counterAmount: number;
    private counterAssetCode: string;


    constructor(fromTrade: Trade, public isEven: boolean){
        this.actionName = fromTrade.base_is_seller ? "Sold " : "Bought ";
        this.baseAmount = parseFloat(fromTrade.base_amount);
        this.counterAmount = parseFloat(fromTrade.counter_amount);
        this.counterAssetCode = fromTrade.counter_asset_code || Constants.NATIVE_ASSET_CODE;
        this.linkText = Utils.formatAmount(this.baseAmount) + " " + (fromTrade.base_asset_code || Constants.NATIVE_ASSET_CODE) +
                        " for " + Utils.formatAmount(this.counterAmount) + " " + this.counterAssetCode;
        this.linkHref = Utils.getExchangeUrl(fromTrade.base_asset_code, fromTrade.base_asset_issuer,
                                             fromTrade.counter_asset_code, fromTrade.counter_asset_issuer);
        this.note = " (price " + Utils.formatPrice(fromTrade.price.n / fromTrade.price.d) + " " + this.counterAssetCode + ")";
    }
}
