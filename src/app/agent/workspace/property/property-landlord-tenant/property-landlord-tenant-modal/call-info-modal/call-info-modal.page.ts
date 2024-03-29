import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DEFAULT_MESSAGES } from '../../../../../../shared/constants';

@Component({
  selector: 'app-call-info-modal',
  templateUrl: './call-info-modal.page.html',
  styleUrls: ['./call-info-modal.page.scss'],
})
export class CallInfoModalPage {

  notAvailable = DEFAULT_MESSAGES.NOT_AVAILABLE_TEXT
  userInfo;
  type;

  constructor(
    private modalController: ModalController
  ) { }

  dismiss() {
    this.modalController.dismiss();
  }

}
