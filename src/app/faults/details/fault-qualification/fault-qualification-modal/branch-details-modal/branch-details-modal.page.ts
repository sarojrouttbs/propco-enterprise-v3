import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DEFAULTS } from 'src/app/shared/constants';

@Component({
  selector: 'app-branch-details-modal',
  templateUrl: './branch-details-modal.page.html',
  styleUrls: ['./branch-details-modal.page.scss'],
})
export class BranchDetailsModalPage {
  branchDetails;
  DEFAULTS = DEFAULTS;
  
  constructor(private modalController: ModalController) { }

  dismiss() {
    this.modalController.dismiss();
  }

}
