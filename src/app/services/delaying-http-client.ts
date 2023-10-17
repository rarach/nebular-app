import { HttpClient } from '@angular/common/http';
import { delay, switchMap } from "rxjs/operators";
import { Observable, of } from 'rxjs';

export class DelayingHttpClient {
    private nextExecutionTime = (new Date()).getTime();
    private readonly MIN_GAP_BETWEEN_CALLS = 2000;

    constructor(private readonly http: HttpClient) { }

    public get<T>(url: string): Observable<T> {
        const now: number = new Date().getTime();
        let delayMs = 0;

        if (this.nextExecutionTime - now < 0) {
            this.nextExecutionTime = now + this.MIN_GAP_BETWEEN_CALLS;
        }
        else {
            delayMs = this.nextExecutionTime - now;
            this.nextExecutionTime += this.MIN_GAP_BETWEEN_CALLS;
        }

        return of(url).pipe(
            delay(delayMs),
            switchMap(url => this.http.get<T>(url))
        );
    }
}
