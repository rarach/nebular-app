/** Represents item in a drop-down list */
export class DropdownOption<T> {
    constructor(public readonly value: T, public readonly text: string, public readonly tooltip: string, public readonly imageUrl: string = null) { }
}
