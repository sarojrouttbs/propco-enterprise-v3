import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavParams, ModalController } from '@ionic/angular';
import { LetAllianceService } from 'src/app/referencing/let-alliance/let-alliance.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tenant-list-modal',
  templateUrl: './tenant-list-modal.page.html',
  styleUrls: ['./tenant-list-modal.page.scss'],
})
export class TenantListModalPage implements OnInit {

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  isSelected: boolean;
  laTenantList: any[] = [];
  propertyId: any;
  tenantId: any;
  selectedRow: any;

  constructor(
    private letAllianceService: LetAllianceService,
    private navParams: NavParams,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.dtOptions = {
      paging: false,
      pagingType: 'full_numbers',
      responsive: true,
      searching: false,
      ordering: false,
      info: false
    };
    this.propertyId = this.navParams.get('propertyId');
    this.getTenantList();
    
  }

  getTenantList() {
    this.letAllianceService.getPropertyTenantList(this.propertyId, '').subscribe(
      res => {
        this.laTenantList = res ? res.data : [];
        this.laTenantList.forEach((item) => {
          item.isReferencingRequired = false; // need to delete this once this field will come in list service. 
          item.isRowChecked = false;
        });
      },
      (error) => {
        console.log(error);
      }
    );
  }

  toggleReferencing(tenant, event) {
    tenant.isReferencingRequired = event.target.checked;
    if (!tenant.isReferencingRequired) {
      tenant.isRowChecked = false;
    }
  }

  selectTenant(tenant: any, event: any) {
    tenant.isRowChecked = event.target.checked;

    if(event.target.checked){
      this.tenantId = tenant.tenantId;
      this.isSelected = true;
      this.laTenantList.forEach(ele =>
      { if(ele.tenantId != tenant.tenantId) {
            ele.isRowChecked = false;
        }
      })
    }
    else{
      const selectedRow = this.laTenantList.find(item => item.isRowChecked === true );
      if(selectedRow){
        this.tenantId = selectedRow.tenantId;
        this.isSelected = true;
      }
      else{
        this.isSelected = false;
        this.tenantId = null;
      }
    }
  }

  dismiss() {
    this.modalController.dismiss({
      tenantId: this.tenantId,
    });
  }
}