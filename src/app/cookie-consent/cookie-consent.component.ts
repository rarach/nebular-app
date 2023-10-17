import { Component } from '@angular/core';
import { NebularService } from '../services/nebular.service';

@Component({
  selector: 'nebular-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.css']
})
export class CookieConsentComponent {

  constructor(readonly nebularService: NebularService) { }
}
