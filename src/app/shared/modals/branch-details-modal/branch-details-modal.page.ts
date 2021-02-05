import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-branch-details-modal',
  templateUrl: './branch-details-modal.page.html',
  styleUrls: ['./branch-details-modal.page.scss'],
})
export class BranchDetailsModalPage implements OnInit {
  branchDetails;

  constructor(private modalController: ModalController) { }

  ngOnInit() { }

  dismiss() {
    this.modalController.dismiss();
  }

}
