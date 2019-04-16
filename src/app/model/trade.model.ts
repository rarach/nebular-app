
export interface Trade {
    id: string;

    base_is_seller: boolean;
    base_asset_type: string;
    base_asset_code?: string;
    base_asset_issuer?: string;
    /** Numeric base amount as string */
    base_amount: string;
    counter_asset_type: string;
    counter_asset_code?: string;
    counter_asset_issuer?: string;
    counter_amount: string;

    price: {
        n: number;
        d: number;
    }
}
