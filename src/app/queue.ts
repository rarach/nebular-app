
export class Queue<T> implements Iterable<T> {
  private _items = new Array<T>();

  public constructor(private readonly capacity: number){}

  public add(item: T) {
    this._items.splice(0, 0, item);
    if (this.size > this.capacity) {
      this._items = this._items.slice(0, this.capacity);
    }
  }

  public get size() : number {
    return this._items.length;
  }

  public [Symbol.iterator](): Iterator<T, any, undefined> {
    let i = 0;
    return {
      next: () => {
        return {
          done: (i >= this._items.length),
          value: this._items.length === 0 ? undefined : this._items[i++]
        }
      }
    };
  }
}
