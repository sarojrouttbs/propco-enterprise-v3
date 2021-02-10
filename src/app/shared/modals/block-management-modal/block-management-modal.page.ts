import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-block-management-modal',
  templateUrl: './block-management-modal.page.html',
  styleUrls: ['./block-management-modal.page.scss'],
})
export class BlockManagementModalPage implements OnInit {
  blockManagement: any;
  managementResponsibilities: any = [];
  faultCategories: any;

  constructor(private modalController: ModalController, private commonService: CommonService) {
  }

  ngOnInit() {
    this.getValue()
  }

  onCancel() {
    this.modalController.dismiss('success');
  }

  dismiss() {
    this.modalController.dismiss();
  }
  
  getValue() {
    let data = this.blockManagement.managementResponsibility.managementResponsibilities;
    if (data) {
      for (let i = 0; i < data.length; i++) {
        this.managementResponsibilities.push(this.getLookup(data[i], this.faultCategories));
      }
    }
  }

  getLookup(index, value) {
    return this.commonService.getLookupValue(index, value);
  }
}
