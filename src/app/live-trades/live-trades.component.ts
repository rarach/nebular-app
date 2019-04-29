import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Subscription } from "rxjs";
import { Title } from '@angular/platform-browser';
import { HorizonRestService } from '../services/horizon-rest.service';
import { LiveTradeItem } from './live-trade-item';


@Component({
    selector: 'app-live-trades',
    templateUrl: './live-trades.component.html',
    styleUrls: ['./live-trades.component.css']
})
export class LiveTradesComponent implements OnInit, OnDestroy {
    private tradesStream: Subscription;
    private streamStart: Date;
    private readonly TIMER_INTERVAL = 5000;

    public duration = "5s";    //TODO: No! Do it as template pipe that gets the timespan as number
    public items = new Array<LiveTradeItem>();

    constructor(private readonly ngZone: NgZone, titleService: Title, private horizonService: HorizonRestService) {
        titleService.setTitle("Live Trades");
    }

    ngOnInit() {
        this.tradesStream = this.horizonService.streamTradeHistory().subscribe(trade => {
            this.items.splice(0, 0, new LiveTradeItem(trade));
            this.calculateStatistics();
        });
        this.streamStart = new Date();

        //NOTE: Angular zones trick to prevent Protractor timeouts
        this.ngZone.runOutsideAngular(() => {
            setInterval(() => {
                this.ngZone.run(() => { this.updateTime(); });
            }, this.TIMER_INTERVAL);
        });
    }

    ngOnDestroy() {
        if (this.tradesStream) {
            this.tradesStream.unsubscribe();
        }
    }

    private updateTime() {     //TODO: to formatting pipe
        let timeDiff = new Date().getTime() - this.streamStart.getTime();
        const hours = Math.floor(timeDiff / 1000 / 60 / 60);
        timeDiff -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(timeDiff / 1000 / 60);
        timeDiff -= minutes * 1000 * 60;
        const seconds = Math.floor(timeDiff / 1000);

        this.duration = "";
        if (hours > 0) {
        this.duration = `${hours}h ${minutes}m`;
        }
        else if (minutes > 0) {
            this.duration = `${minutes}m ${seconds}s`;
        }
        else {
            this.duration = `${seconds}s`;
        }
    }

    private calculateStatistics() { 
        //TODO
    }
}
