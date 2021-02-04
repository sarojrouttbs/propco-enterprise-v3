import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';

@Component({
  selector: 'app-block-management-modal',
  templateUrl: './block-management-modal.page.html',
  styleUrls: ['./block-management-modal.page.scss'],
})
export class BlockManagementModalPage implements OnInit {
  blockManagement: any;

  constructor(private router: Router, private modalController: ModalController, private location: PlatformLocation) { 
    this.router.events.subscribe(async () => {
      const isModalOpened = await this.modalController.getTop();
      if (router.url.toString() === "/dashboard" && isModalOpened) this.modalController.dismiss();
    });
    this.location.onPopState(() => this.modalController.dismiss());
  }

  ngOnInit() {
  }

  onCancel(){
    this.modalController.dismiss('success');
  }
}
