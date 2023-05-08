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
declare function openScreen(key: string): any;

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
  @Input() singleTenantOption: string;
  isTableReady: boolean = false;
  DEFAULTS = DEFAULTS;
  tenantCaseId: any;
  searchApplicantControl: FormControl = new FormControl();
  resultsAvailable = null;
  applicantList = [];
  selectedTenants = [];
  isItemAvailable = false;

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
    this.singleTenantOption = this.navParams.get('singleTenantOption');
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
            item.isLead = false;
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

  toggleLead(tenant: any, event: any) {
    if (!event.target.checked) {
      tenant.isLead = event.target.checked;
      this.getSelectedTenantList();
      return;
    }
    // if (this.singleTenantOption) {
    //   const checkIfLeadPresent = this.laTenantList.filter(x => x.isLead && x.isRowChecked);
    //   if (!checkIfLeadPresent.length) {
    //     tenant.isLead = event.target.checked;
    //   } else {
    //     if(tenant.isRowChecked) {
    //       this.commonService.showAlert('Change Sharer', `Only one record can be set as ‘Lead Tenant’`);
    //       tenant.isLead = false;
    //       event.target.checked = false;
    //     }
    //   }
    // } else {
    //   tenant.isLead = event.target.checked;
    // }
    tenant.isLead = event.target.checked;
    this.getSelectedTenantList();
  }

  selectTenant(tenant: any, event: any) {
    tenant.isRowChecked = event.target.checked;
    this.getSelectedTenantList();
  }

  private getSelectedTenantList() {
    this.selectedTenants = [];
    const tenantList = this.laTenantList.filter(x => x.isRowChecked);
    if (tenantList.length) {
      tenantList.map((list) => {
        this.selectedTenants.push({
          applicantId: list.entityId,
          isLead: list.isLead
        });
      });
    }
    return tenantList;
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
    this.commonService.showConfirm('Change sharer', 'Are you sure you want to cancel?', '', 'YES', 'NO').then(response => {
      if (response) {
        openScreen('CloseDialog');
      }
    });
  }

  onSearch(event: any): void {
    const searchString = event.target.value;
    // if the value is an empty string don't filter the items
    if (searchString && searchString.trim() !== '' && searchString.length > 3) {
      this.searchApplicant(searchString);
    } else {
      this.isItemAvailable = false;
    }
  }

  private searchApplicant(searchString: string) {
    this.changeSharerService.searchApplicant(searchString).subscribe((res) => {
      if (res && res.data) {
        this.applicantList = res.data;
        this.isItemAvailable = true;
      } else {
        this.isItemAvailable = false;
      }
    }, error => {
      this.isItemAvailable = true;
    });
  }

  async onSelectApplicant(result: any) {
    const checkForDuplicateRecord = this.laTenantList.filter(x => x.entityId === result.entityId);
    if(checkForDuplicateRecord.length) {
      this.commonService.showMessage('This applicant is already added.', 'Change sharer', 'error');
      return;
    }
    const coApplicants = await this.getApplicantCoApplicants(result?.entityId) as any[];
    let applicant = result;
    applicant.name = applicant.fullName;
    applicant.isRowChecked = false;
    applicant.type = 'Applicant';
    applicant.isLead = false;
    const newA = [applicant].concat(this.laTenantList);
    this.laTenantList = [];
    this.laTenantList = newA;
    if (coApplicants?.length) {
      coApplicants.map((coApp) => {
        coApp.name = coApp.fullName;
        coApp.isRowChecked = false;
        coApp.type = 'Co-Applicant';
        coApp.isLead = false;
        coApp.entityId = coApp.applicantId;
        const newA = [coApp].concat(this.laTenantList);
        this.laTenantList = [];
        this.laTenantList = newA;
      });
    }
  }

  private getApplicantCoApplicants(applicantId: any) {
    return new Promise((resolve) => {
      this.changeSharerService.getApplicantCoApplicants(applicantId).subscribe(
        res => {
          resolve(res ? res?.data : []);
        },
        (error) => {
          resolve([]);
        }
      );
    });
  }

  private changeSharer(agreementId: any, req: any) {
    return new Promise((resolve) => {
      this.changeSharerService.changeSharer(agreementId, req).subscribe(
        res => {
          resolve(true);
        },
        (error) => {
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Change sharer', 'error');
          resolve(false);
        }
      );
    });
  }

  hideSuggestion() {
    setTimeout(() => {
      this.isItemAvailable = false;
    }, 200);
  }

  submit() {
    this.commonService.showConfirm('Change sharer', 'Are you sure you want to proceed?', '', 'YES', 'NO').then(async response => {
      if (response) {
        if (this.selectedTenants.length) {
          if (this.singleTenantOption) {
            const getLeadsList = this.selectedTenants.filter(x => x.isLead);
            if (getLeadsList.length > 1) {
              this.commonService.showAlert('Change Sharer', `Only one record can be set as ‘Lead Tenant’`);
              return;
            }
          }
          const checkAtleastOneLead = this.selectedTenants.filter(x => x.isLead);
          if (checkAtleastOneLead.length) {
            const changed = await this.changeSharer(this.agreementId, this.selectedTenants);
            if (changed) {
              openScreen('CloseDialog');
            }
          } else {
            this.commonService.showAlert('Change sharer', 'Please select a lead.');
          }
        } else {
          this.commonService.showAlert('Change sharer', 'Please select tenant(s) to proceed.')
        }
      }
    });
  }


}