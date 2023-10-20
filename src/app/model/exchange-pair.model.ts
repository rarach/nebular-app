import { Asset } from "./asset.model";


/**
 * Container to carry user's custom exchange, i.e. base and counter Asset
 * NOTE: base+counter asset combination doesn't uniquely identify a pair instance as user can do different things
 *       with different instances of the same pair. Hence unique identifier is expected to be provided for each instance.
 */
export class ExchangePair {
  /**
     * @param id unique ID of this pair instance
     * @param baseAsset base Asset instance
     * @param counterAsset counter Asset instance
     */
  constructor(public readonly id: string, public readonly baseAsset: Asset, public readonly counterAsset: Asset){ }
}
