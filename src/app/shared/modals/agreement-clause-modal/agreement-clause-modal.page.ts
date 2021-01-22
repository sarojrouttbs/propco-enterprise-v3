import { PlatformLocation } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-agreement-clause-modal',
  templateUrl: './agreement-clause-modal.page.html',
  styleUrls: ['./agreement-clause-modal.page.scss'],
})
export class AgreementClauseModalPage implements OnInit {

  agreementClauses;

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
