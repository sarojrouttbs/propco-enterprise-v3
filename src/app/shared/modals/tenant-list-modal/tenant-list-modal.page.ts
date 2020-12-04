import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { LetAllianceService } from 'src/app/referencing/let-alliance/let-alliance.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: "app-tenant-list-modal",
  templateUrl: "./tenant-list-modal.page.html",
  styleUrls: ["./tenant-list-modal.page.scss"],
})
export class TenantListModalPage implements OnInit {
  selected;
  toggled = false;
  laTenantList: any[] = [];
  propertyId: any;
  titleList: any[] = [
    { value: 1, type: "Mr" },
    { value: 2, type: "Mrs" },
    { value: 3, type: "Miss" },
    { value: 4, type: "Ms" },
    { value: 5, type: "Dr" },
    { value: 6, type: "Company" },
    { value: 7, type: "Other" },
  ];
  statusList: any[] = [
    { value: 0, type: "Tenant is not submitted" },
    { value: 1, type: "Tenant is under process" },
    { value: 2, type: "Tenant has been graded/completed" },
  ];
  selectedRow: any;
  tenanatId: any;
  constructor(
    private letAllianceService: LetAllianceService,
    private navParams: NavParams,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.propertyId = this.navParams.get("propertyId");
    this.getTenantList(this.propertyId);
  }

  getTenantList(propertyId) {
    this.letAllianceService
      .getPropertyTenantList("ac1137a8-71c8-16d3-8171-c8270420023c", "")
      .subscribe(
        (res) => {
          this.laTenantList = res ? res.data : [];
          this.laTenantList.forEach((item) => {
            item["toggled"] = false;
            item["rowChecked"] = false;
          });
          console.log(this.laTenantList);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  toggleButtons(tenant, event) {
    tenant["toggled"] = event.target.checked;
    console.log(tenant, event);
    if (!tenant["toggled"]) {
      tenant["rowChecked"] = false;
      this.buttonStatus();
    }
  }

  private buttonStatus() {
    if (this.selectedRow) {
      this.laTenantList.some((item) => {
        if (item.tenantId == this.selectedRow.tenantId) {
          this.selected = item.toggled;
          this.selectedRow = null;
          return true;
        }
      });
    }
  }

  submitButtonStatus(tenant, event) {
    this.selectedRow = tenant;
    this.selected = event.target.checked;
    tenant["rowChecked"] = this.selected;
  }

  tenantDetail() {
    this.laTenantList.forEach((element) => {
      if (element.rowChecked) {
        this.tenanatId = element.tenantId;
        console.log(this.tenanatId);
        this.dismiss();
      }
    });
  }
  dismiss() {
    this.modalController.dismiss({
      tenantId: this.tenanatId,
    });
  }
}