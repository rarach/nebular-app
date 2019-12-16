import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { ExchangePair } from "../model/exchange-pair.model";


@Injectable({
    providedIn: 'root'
})
export class UiActionsService {
    private _draggingExch = new Subject<ExchangePair>();
    private _exchange: ExchangePair = null;


    constructor() {}



    public get DraggingExchange() : ExchangePair {
        return this._exchange;
    }

    public draggingStarted(exchPair: ExchangePair) {
        if (exchPair) {
            this._draggingExch.next(exchPair);
            this._exchange = exchPair;
            this.getWindow().startDragging("customExchange" + exchPair.id);
        }
    }

    public draggingFinished() {
        this._draggingExch = null;
        this._exchange = null;
        this.getWindow().isDraggingExchange = false;
    }


    //Dirty helper to access window object without compiler warnings
    private getWindow() : any { return window; }
}
