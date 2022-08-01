import { Component, Input } from '@angular/core';
import { NavParams } from '@ionic/angular';
NavParams

@Component({
  selector: 'app-simple-popover',
  templateUrl: './simple-popover.page.html',
  styleUrls: ['./simple-popover.page.scss'],
})
export class SimplePopoverPage {
  @Input() data;
}
