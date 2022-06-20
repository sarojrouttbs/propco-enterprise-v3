import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ReferencingService } from 'src/app/referencing/referencing.service';
import { DEFAULTS, PROPCO, REFERENCING } from '../../constants';
import { CommonService } from '../../services/common.service';
import { HttpParams } from '@angular/common/http';

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
  referencingApplicationStatus: any;
  selectedRow: any;

  lookupdata: any;
  referencingLookupdata: any;
  agreementStatuses: any[] = [];
  proposedAgreementStatusIndex: any
  referencingApplicantStatusTypes: any[] = [];

  @Input() paramPropertyId: string;
  isTableReady: boolean  = false;
  DEFAULTS = DEFAULTS;

  constructor(
    private referencingService: ReferencingService,
    private navParams: NavParams,
    private modalController: ModalController,
    private commonService: CommonService,
  ) {}

  async ngOnInit() {
    this.propertyId = this.navParams.get('paramPropertyId');
    this.getLookupData();
    this.dtOptions = {
      paging: false,
      pagingType: 'full_numbers',
      responsive: true,
      searching: false,
      ordering: false,
      info: false,
      scrollY: '97px',
      scrollCollapse: false
    };
    await this.getTenantList();
    this.isTableReady = true

  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.referencingLookupdata = this.commonService.getItem(PROPCO.REFERENCING_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.referencingLookupdata) {
      this.setReferencingLookupData(this.referencingLookupdata);
    } else {
      this.referencingService.getLookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(data => {
        this.commonService.setItem(PROPCO.REFERENCING_LOOKUP_DATA, data);
        this.referencingLookupdata = data;
        this.setReferencingLookupData(data);
      });
    }
  }

  private setLookupData(data: any): void {
    this.agreementStatuses = data.agreementStatuses;
  }

  private setReferencingLookupData(data: any): void {
    this.referencingApplicantStatusTypes = data.applicantStatusTypes;
  }

  private getTenantList() {
    this.proposedAgreementStatusIndex = this.agreementStatuses.find(obj => obj.value === 'Proposed').index;
    const params = new HttpParams()
      .set('agreementStatus', this.proposedAgreementStatusIndex ? this.proposedAgreementStatusIndex : '');

    const promise = new Promise((resolve, reject) => {
      this.referencingService.getPropertyTenantList(this.propertyId, params).subscribe(
        res => {
          this.laTenantList = res ? res.data : [];
          this.laTenantList.forEach((item) => {
            item.isRowChecked = false;
          });
          resolve(this.laTenantList);
        },
        (error) => {
          resolve(this.laTenantList);
        }
      );
    });
    return promise;
  }

  toggleReferencing(tenant: any, event: any) {
    tenant.isReferencingRequired = event.target.checked;
    const tmpObj = {
      isReferencingRequired: tenant.isReferencingRequired,
    }
    if (!tenant.isReferencingRequired) {
      tenant.isRowChecked = false;
    }
    this.updateTenantDetails(tenant.tenantId, tmpObj);
  }

  private updateTenantDetails(tenantId: any, requestObj: any) {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.updateTenantDetails(tenantId, requestObj).subscribe(
        res => {
          resolve(true);
        },
        (error) => {
          console.log(error);
          resolve(false);
        }
      );
    });
    return promise;
  }

  selectTenant(tenant: any, event: any) {
    tenant.isRowChecked = event.target.checked;

    if(event.target.checked){
      this.tenantId = tenant.tenantId;
      this.referencingApplicationStatus = tenant.referencingApplicationStatus;
      this.isSelected = true;
      this.laTenantList.forEach(
        ele => { 
          if(ele.tenantId != tenant.tenantId) {
            ele.isRowChecked = false;
          }
      })
    }
    else{
      const selectedRow = this.laTenantList.find(item => item.isRowChecked === true );
      if(selectedRow){
        this.tenantId = selectedRow.tenantId;
        this.referencingApplicationStatus = selectedRow.referencingApplicationStatus;
        this.isSelected = true;
      }
      else{
        this.isSelected = false;
        this.tenantId = null;
        this.referencingApplicationStatus = null;
      }
    }
  }

  getLookupValue(index: any, lookup: any) {
    return this.commonService.getLookupValue(index, lookup);
  }

  dismiss() {
    this.modalController.dismiss({
      tenantId: this.tenantId,
      referencingApplicationStatus: this.referencingApplicationStatus,
      dismissed: true
    });
  }
}