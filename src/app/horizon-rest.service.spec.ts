import { TestBed, inject } from '@angular/core/testing';

import { HorizonRestService } from './horizon-rest.service';

describe('HorizonRestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HorizonRestService]
    });
  });

  it('should be created', inject([HorizonRestService], (service: HorizonRestService) => {
    expect(service).toBeTruthy();
  }));
});
