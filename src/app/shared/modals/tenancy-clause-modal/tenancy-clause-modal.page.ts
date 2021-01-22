import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tenancy-clause-modal',
  templateUrl: './tenancy-clause-modal.page.html',
  styleUrls: ['./tenancy-clause-modal.page.scss'],
})
export class TenancyClauseModalPage implements OnInit {
  tenancyClauses;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
