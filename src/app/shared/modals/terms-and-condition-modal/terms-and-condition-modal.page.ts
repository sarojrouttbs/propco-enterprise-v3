import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms-and-condition-modal',
  templateUrl: './terms-and-condition-modal.page.html',
  styleUrls: ['./terms-and-condition-modal.page.scss'],
})
export class TermsAndConditionModalPage implements OnInit {
  data: any;
  heading: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

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
