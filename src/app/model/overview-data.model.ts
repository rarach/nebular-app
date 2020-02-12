import { Asset } from "./asset.model";

export interface OverviewData {
    timestamp: string;
    topExchanges: Array<{ baseAsset: Asset; counterAsset: Asset; }> ;
}