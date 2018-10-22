import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { OverviewComponent } from './overview.component';


describe('OverviewComponent', () => {
    let component: OverviewComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: Title, useClass: Title }
            ]
        })
        .compileComponents();
    }));

    beforeEach(inject([Title], (titleService) => {
        component = new OverviewComponent(titleService);
    }));

    it("should have the title 'Nebular'", () => {
        expect(component).toBeTruthy();
        const titleService = TestBed.get(Title);
        expect(titleService.getTitle()).toBe("Nebular");
    });
});
