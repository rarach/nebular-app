import { Component } from '@angular/core';
import { UiActionsService } from './services/ui-actions.service';

import * as $ from "jquery";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public constructor(private uiActions: UiActionsService) {

  }

  onClick() {
    if (this.uiActions.DraggingExchange) {
      //If we received the click event, it was outside a slot where the exchange thumbnail being dragged can
      //be dropped => cancel the reposition
      this.uiActions.draggingFinished();
    }
  }
}
