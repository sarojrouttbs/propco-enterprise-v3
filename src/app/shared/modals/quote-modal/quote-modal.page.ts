import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-quote-modal',
  templateUrl: './quote-modal.page.html',
  styleUrls: ['./quote-modal.page.scss'],
})
export class QuoteModalPage implements OnInit {
  faultNotificationId;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService,
    private location: PlatformLocation,
    private router: Router) {

    this.router.events.subscribe((val) => {
      if (val) {
        this.dismiss();
      }
    });
    this.location.onPopState(() => this.dismiss());

  }

  ngOnInit() {
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
