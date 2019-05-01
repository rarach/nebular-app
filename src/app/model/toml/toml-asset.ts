/** Asset, i.e. one block from section [[CURRENCIES]] */
export class TomlAsset {
    constructor(public readonly code: string, public readonly issuer: string, public readonly display_decimals: number) { }

    public name: string;
    public desc: string;
    /** Asset Icon URL */
    public image: string;
}
