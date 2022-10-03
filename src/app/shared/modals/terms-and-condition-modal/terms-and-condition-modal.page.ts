import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms-and-condition-modal',
  templateUrl: './terms-and-condition-modal.page.html'
})
export class TermsAndConditionModalPage {
  data: any;
  heading: string;

  constructor(private modalController: ModalController) { }

  dismiss() {
    this.modalController.dismiss({
      accepted: false,
      dismissed: true
    });
  }

  accept() {
    this.modalController.dismiss({
      accepted: true,
      dismissed: true
    });
  }

}
