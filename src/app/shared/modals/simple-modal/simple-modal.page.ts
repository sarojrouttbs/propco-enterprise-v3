import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-simple-modal',
  templateUrl: './simple-modal.page.html',
  styleUrls: ['./simple-modal.page.scss'],
})
export class SimpleModalPage implements OnInit, OnDestroy {

  data: any;
  heading: string;
  button: string;
  sessionTimer: boolean;
  counter: any;
  startInterval;
  constructor(private navParams: NavParams, private modalController: ModalController, private commonService: CommonService, private router: Router) {
  }

  ngOnInit() {
    this.data = this.navParams.get('data');
    this.heading = this.navParams.get('heading');
    this.button = this.navParams.get('button');
  }

  logout() {
    this.commonService.logout();
    this.dismiss();
  }
  
  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  ngOnDestroy() {
    //this.stopInterval();
  }

}
