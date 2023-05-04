import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { ReferencingService } from 'src/app/referencing/referencing.service';
import { HttpParams } from '@angular/common/http';
import { DEFAULTS, PROPCO, REFERENCING } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { ChangeSharerService } from '../../change-sharer.service';
import { FormControl } from '@angular/forms';
import { debounceTime, refCount, switchMap } from 'rxjs/operators';

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
  agreementId: any;
  tenantId: any;
  referencingApplicationStatus: any;
  selectedRow: any;

  lookupdata: any;
  referencingLookupdata: any;
  agreementStatuses: any[] = [];
  proposedAgreementStatusIndex: any
  referencingApplicantStatusTypes: any[] = [];

  @Input() paramPropertyId: string;
  @Input() paramAgreementId: string;
  @Input() paramMessage: string;
  isTableReady: boolean = false;
  DEFAULTS = DEFAULTS;
  tenantCaseId: any;
  searchApplicantControl: FormControl = new FormControl();
  resultsAvailable = null;
  applicantList: Observable<OfferModels.IApplicantLisResponse>;

  constructor(
    private referencingService: ReferencingService,
    private navParams: NavParams,
    private modalController: ModalController,
    private commonService: CommonService,
    private changeSharerService: ChangeSharerService
  ) { }

  async ngOnInit() {
    this.propertyId = this.navParams.get('paramPropertyId');
    this.agreementId = this.navParams.get('paramAgreementId');
    this.getLookupData();
    this.dtOptions = {
      paging: false,
      pagingType: 'full_numbers',
      responsive: true,
      searching: false,
      ordering: false,
      info: false,
      scrollCollapse: false
    };
    await this.getPropertyTenancy();
    this.isTableReady = true;

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

  private getPropertyTenancy() {
    return new Promise((resolve) => {
      this.changeSharerService.getPropertyTenancy(this.propertyId).subscribe(
        res => {
          this.laTenantList = res ? res.data : [];
          /** Filter by agreement id : tmp */
          this.laTenantList = this.laTenantList.filter(x => x.agreementId === this.paramAgreementId);
          this.laTenantList = this.laTenantList && this.laTenantList.length ? this.laTenantList[0].tenants : [];
          this.laTenantList.forEach((item) => {
            item.name = item.displayAs;
            item.reference = item?.reference;
            item.entityId = item?.tenantId;
            item.entityType = 'TENANT';
            item.isRowChecked = false;
            if (item.isLead) {
              item.type = 'Lead Tenant'
            } else {
              item.type = 'Co-Tenant'
            }
          });
          console.log(JSON.stringify(this.laTenantList))
          resolve(this.laTenantList);
        },
        (error) => {
          resolve(this.laTenantList);
        }
      );
    });
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
    return new Promise((resolve) => {
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
  }

  selectTenant(tenant: any, event: any) {
    tenant.isRowChecked = event.target.checked;

    if (event.target.checked) {
      this.tenantId = tenant.tenantId;
      this.tenantCaseId = tenant.caseId;
      this.referencingApplicationStatus = tenant.referencingApplicationStatus;
      this.isSelected = true;
      this.laTenantList.forEach(
        ele => {
          if (ele.tenantId != tenant.tenantId) {
            ele.isRowChecked = false;
          }
        })
    }
    else {
      const selectedRow = this.laTenantList.find(item => item.isRowChecked === true);
      if (selectedRow) {
        this.tenantId = selectedRow.tenantId;
        this.tenantCaseId = selectedRow.caseId;
        this.referencingApplicationStatus = selectedRow.referencingApplicationStatus;
        this.isSelected = true;
      }
      else {
        this.isSelected = false;
        this.tenantId = null;
        this.tenantCaseId = null;
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
      tenantCaseId: this.tenantCaseId,
      dismissed: true
    });
  }
  cancel() {
    this.modalController.dismiss();
  }

  onSearch(event: any): void {
    const searchString = event.target.value;
    if (searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
    this.applicantList = this.searchApplicantControl.valueChanges.pipe(
      debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.searchApplicant(value) : new Observable())
      );
  }

  private searchApplicant(applicantId: string): Observable<any> {
    return this.changeSharerService.searchApplicant(applicantId);
  }

  onSelectApplicant(result: any) {

  }
}