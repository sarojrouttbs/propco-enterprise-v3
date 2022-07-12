import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DEFAULTS } from '../../constants';

@Component({
  selector: 'app-branch-details-modal',
  templateUrl: './branch-details-modal.page.html',
  styleUrls: ['./branch-details-modal.page.scss'],
})
export class BranchDetailsModalPage implements OnInit {
  branchDetails;
  DEFAULTS = DEFAULTS;
  
  constructor(private modalController: ModalController) { }

  ngOnInit() { }

  dismiss() {
    this.modalController.dismiss();
  }

}
