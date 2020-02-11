import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NebularService } from './nebular.service';


describe('NebularService', () => {
    let injector: TestBed;
    let service: NebularService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NebularService]
        });
        injector = getTestBed();
        service = injector.get(NebularService);
        httpMock = injector.get(HttpTestingController);
    });

    //todo
});