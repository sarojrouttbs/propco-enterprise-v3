import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DEFAULT_MESSAGES } from '../../constants';

@Component({
  selector: 'app-call-info-modal',
  templateUrl: './call-info-modal.page.html',
  styleUrls: ['./call-info-modal.page.scss'],
})
export class CallInfoModalPage implements OnInit {

  notAvailable = DEFAULT_MESSAGES.NOT_AVAILABLE_TEXT
  userInfo;
  type;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() { }

  dismiss() {
    this.modalController.dismiss();
  }

}
