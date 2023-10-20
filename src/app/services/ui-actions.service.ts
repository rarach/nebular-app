import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { ExchangePair } from "../model/exchange-pair.model";

@Injectable({
    providedIn: 'root'
})
export class UiActionsService {
    private _draggingExch = new Subject<ExchangePair>();
    private _exchange: ExchangePair = null;

    public get DraggingExchange() : ExchangePair {
        return this._exchange;
    }

    public draggingStarted(exchPair: ExchangePair): void {
        if (exchPair) {
            this._draggingExch.next(exchPair);
            this._exchange = exchPair;
            this.getWindow().startDragging("customExchange" + exchPair.id);
        }
    }

    public draggingFinished(): void {
        this._exchange = null;
        this.getWindow().finishDragging();
    }


    //Dirty helper to access window object without compiler warnings
    private getWindow() : any { return window; }
}
