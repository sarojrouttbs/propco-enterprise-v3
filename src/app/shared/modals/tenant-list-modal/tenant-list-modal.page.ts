import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavParams, ModalController } from '@ionic/angular';
import { LetAllianceService } from 'src/app/referencing/let-alliance/let-alliance.service';
import { CommonService } from '../../services/common.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-tenant-list-modal',
  templateUrl: './tenant-list-modal.page.html',
  styleUrls: ['./tenant-list-modal.page.scss'],
})
export class TenantListModalPage implements OnInit {

  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;
  selected;
  toggled = false;
  laTenantList: any[] = [];
  propertyId: any;
  dtOptions: any = {};
  titleList: any[] = [
    { value: 1, type: 'Mr' },
    { value: 2, type: 'Mrs' },
    { value: 3, type: 'Miss' },
    { value: 4, type: 'Ms' },
    { value: 5, type: 'Dr' },
    { value: 6, type: 'Company' },
    { value: 7, type: 'Other' },
  ];
  statusList: any[] = [
    { value: 0, type: 'Tenant is not submitted' },
    { value: 1, type: 'Tenant is under process' },
    { value: 2, type: 'Tenant has been graded/completed' },
  ];
  selectedRow: any;
  tenanatId: any;
  constructor(
    private letAllianceService: LetAllianceService,
    private navParams: NavParams,
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit() {
    this.propertyId = this.navParams.get('propertyId');
    this.getTenantList(this.propertyId);
  }

  getTenantList(propertyId) {
    this.letAllianceService
      .getPropertyTenantList('ac1137a8-71c8-16d3-8171-c8270420023c', '')
      .subscribe(
        (res) => {
          this.laTenantList = res ? res.data : [];
          // this.laTenantList.push(JSON.parse(JSON.stringify(res.data[0])));
          // this.laTenantList[1].tenantId = 111111111111;
          this.laTenantList.forEach((item) => {
            item['toggled'] = false;
            item['rowChecked'] = false;
          });
        },
        (error) => {
          console.log(error);
        }
      );
  }

  toggleButtons(tenant, event) {
    tenant['toggled'] = event.target.checked;
    if (!tenant['toggled']) {
      tenant['rowChecked'] = false;
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
    tenant['rowChecked'] = this.selected;
    this.laTenantList.forEach(ele =>
      { if(ele.tenantId != tenant.tenantId) {
            ele['rowChecked'] = false;
      }
      })
  }

  tenantDetail() {
    this.laTenantList.forEach((element) => {
      if (element.rowChecked) {
        this.tenanatId = element.tenantId;
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