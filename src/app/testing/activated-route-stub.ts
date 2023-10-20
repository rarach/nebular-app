import { convertToParamMap, ParamMap, Params } from '@angular/router';
import { ReplaySubject } from 'rxjs';

//credit belongs to https://angular.io/guide/testing#activatedroutestub
export class ActivatedRouteStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `paramMap` observable
  private subject = new ReplaySubject<ParamMap>();
  
  constructor(initialParams?: Params) {
    this.setParamMap(initialParams);
  }
  
  /** The mock paramMap observable */
  readonly paramMap = this.subject.asObservable();
  
  /** Set the paramMap observables's next value */
  setParamMap(params?: Params) {
    this.subject.next(convertToParamMap(params));
  }
}
