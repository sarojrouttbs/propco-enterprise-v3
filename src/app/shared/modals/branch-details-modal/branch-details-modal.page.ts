import { PlatformLocation } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-branch-details-modal',
  templateUrl: './branch-details-modal.page.html',
  styleUrls: ['./branch-details-modal.page.scss'],
})
export class BranchDetailsModalPage implements OnInit {
  branchDetails;

  constructor(private modalController: ModalController, private location: PlatformLocation,
    private router: Router) {
    this.router.events.subscribe((val) => {
      if (val) {
        this.dismiss();
      }
    });
    this.location.onPopState(() => this.dismiss());
  }

  ngOnInit() { }

  dismiss() {
    this.modalController.dismiss();
  }

}
