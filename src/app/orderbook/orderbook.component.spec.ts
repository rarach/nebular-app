import { async, TestBed, inject } from '@angular/core/testing';

import { OrderbookComponent } from './orderbook.component';
import { HorizonRestService } from '../services/horizon-rest.service';


describe('OrderbookComponent', () => {
    let component: OrderbookComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: HorizonRestService, useValue: {/*TODO: definitely something better*/} }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([HorizonRestService], (horizonService) => {
        component = new OrderbookComponent(horizonService);
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
