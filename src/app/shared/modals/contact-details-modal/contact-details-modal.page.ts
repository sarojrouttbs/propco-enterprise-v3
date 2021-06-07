import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-contact-details-modal',
  templateUrl: './contact-details-modal.page.html',
  styleUrls: ['./contact-details-modal.page.scss'],
})
export class ContactDetailsModalPage implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
