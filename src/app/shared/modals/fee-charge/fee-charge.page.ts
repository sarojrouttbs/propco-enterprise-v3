import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DEFAULT_MESSAGES } from '../../constants';

@Component({
  selector: 'app-fee-charge',
  templateUrl: './fee-charge.page.html',
  styleUrls: ['./fee-charge.page.scss'],
})
export class FeeChargePage {
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  constructor(private modalController: ModalController) { }

  dismiss() {
    this.modalController.dismiss();
  }
}
