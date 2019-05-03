/** Asset, i.e. one block from section [[CURRENCIES]] */
export class TomlAsset {
    //TODO: looks like we don't use display_decimals. Delete it if so.
    constructor(public readonly code: string, public readonly issuer: string, public readonly display_decimals: number) { }

    public name: string;
    public desc: string;
    /** Asset Icon URL */
    public image: string;
}
