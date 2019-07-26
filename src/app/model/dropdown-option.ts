/** Represents item in a drop-down list */
export class DropdownOption {
    constructor(public readonly value: string, public readonly text: string, public readonly tooltip: string, public readonly imageUrl: string = null) { }
}
