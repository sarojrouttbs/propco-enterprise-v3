import { PlatformLocation } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tenancy-clause-modal',
  templateUrl: './tenancy-clause-modal.page.html',
  styleUrls: ['./tenancy-clause-modal.page.scss'],
})
export class TenancyClauseModalPage implements OnInit {
  tenancyClauses;

  constructor(private modalController: ModalController, private location: PlatformLocation,
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
