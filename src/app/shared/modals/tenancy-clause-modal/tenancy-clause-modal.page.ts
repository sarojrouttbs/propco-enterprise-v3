import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-tenancy-clause-modal',
  templateUrl: './tenancy-clause-modal.page.html',
  styleUrls: ['./tenancy-clause-modal.page.scss'],
})
export class TenancyClauseModalPage {
  tenancyClauses;

  constructor(private modalController: ModalController) { }

  dismiss() {
    this.modalController.dismiss();
  }

}
