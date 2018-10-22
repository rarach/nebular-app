import { async, TestBed, inject } from '@angular/core/testing';

import { ConfigurationComponent } from './configuration.component';
import { Title } from '@angular/platform-browser';


describe('ConfigurationComponent', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [ { provide: Title, useClass: TitleStub } ]
        })
        .compileComponents();
    }));

    it('should create', inject([Title], (titleService) => {
        const component = new ConfigurationComponent(titleService);
        expect(component).toBeTruthy();
        expect(titleService.title).toBe("Nebular - Configuration");
    }));
});

class TitleStub {
    title: string = null;

    setTitle(value: string) {
        this.title = value;
    }
}
