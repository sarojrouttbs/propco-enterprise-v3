import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-simple-popover',
  templateUrl: './simple-popover.page.html'
})
export class SimplePopoverPage {
  @Input() data;
}
