import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { AgentService } from 'src/app/agent/agent.service';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agreement-details',
  templateUrl: './agreement-details.component.html',
  styleUrls: ['./agreement-details.component.scss'],
})
export class AgreementDetailsComponent implements OnInit {
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  DATE_FORMAT = DATE_FORMAT;
  agreementDetailsForm: FormGroup;
  tenantNameList = [];
  lookupdata: any;
  frequencyTypes: any;
  agreementStatuses: any;
  managementTypes: any;
  contractTypes: any;
  agreementPeriodicities: any;
  inventoryPreparedByList: any;
  agreementDetails: any;
  rentFrequencyList = Array.from(Array(100).keys());
  agreementTenantDetails: any;
  @Input() selectedTenant;
  @Output() propcoAgreementId = new EventEmitter<any>();
  tenant: any;
  activeLink: any;
  dateControl = ['lastRentRequestDate', 'nextClaimDate', 'originalStart', 'originalEnd', 'checkInDate', 'checkOutDate', 'renewalStart', 'tenancyStartDate', 'tenancyEndDate', 'noticeDate', 'noticeProcessedDate'];

  private unsubscribe = new Subject<void>();
  formStatus: FormStatus.Saving | FormStatus.Saved | FormStatus.Idle = FormStatus.Idle;
  formChangedValue: any;

  constructor(
    private agentService: AgentService,
    private _formBuilder: FormBuilder,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedTenant && changes.selectedTenant.currentValue) {
      this.tenant = this.selectedTenant;
      this.initAgreementDetailsApi();
    }
  }

  ngOnInit() {
    this.rentFrequencyList.shift();
    this.initAPI();
  }

  private async initAPI() {
    this.getLookupData();
    this.creatForm();
    this.updateDetails();
  }

  private async initAgreementDetailsApi() {
    this.agreementDetails = await this.getAgreementDetails();
    this.propcoAgreementId.emit(this.agreementDetails.propcoAgreementId);
    this.agreementTenantDetails = this.agreementDetails.agreementTenantDetail;
    this.patchAgreementDetails();
  }

  creatForm() {
    this.agreementDetailsForm = this._formBuilder.group({
      tenantName: [],
      rent: [],
      rentFrequency: [],
      frequencyType: [],
      commissionPercentage: [],
      managementType: [],
      totalOccupants: [{ value: '', disabled: true }],
      noOfOccupiers: [],
      status: [],
      nextClaimDate: [],
      dayRentDue: [],
      directDebitDueDay: ['0'],
      noOfChildren: [],
      noOfHouseholds: [],
      tenancy: [],
      room: [],
      lastRentRequestDate: [],
      occupier: [],
      permittedDelay: [],
      noOfPermittedOccupier: [],
      originalStart: [],
      originalEnd: [],
      isLapseAfterEffectiveDateExpire: [],
      isCheckin: [],
      checkInDate: [],
      isCheckout: [],
      checkOutDate: [],
      isPostRent: [],
      isAllowPayment: [],
      isOnHold: [],
      renewalStart: [],
      renewalRent: [],
      suggestedTerm: [],
      suggestedRent: [],
      suggestedPeriodicity: [],
      contractType: [],
      contractSubType: [],
      isStudentTypeAgreement: [],
      isChangeOfSharerAgreement: [],
      tenancyStartDate: [],
      tenancyEndDate: [],
      noticeDate: [],
      noticeProcessedDate: [],
      isExcludeFromArrears: [],
      inventoryPreparedBy: []
    });
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data: any) {
    this.frequencyTypes = data.frequencyTypes;
    this.agreementStatuses = data.agreementStatuses;
    this.managementTypes = data.managementTypes;
    this.contractTypes = data.contractTypes;
    this.agreementPeriodicities = data.agreementPeriodicities;
    this.inventoryPreparedByList = data.inventoryPreparedBy;
  }

  private getAgreementDetails() {
    return new Promise((resolve) => {
      this.agentService.getAgreementDetails(this.tenant?.agreementId).subscribe(
        (res) => {
          resolve(res ? res : {});
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  private patchAgreementDetails() {
    this.agreementDetailsForm.patchValue(this.agreementDetails)
    this.agreementDetailsForm.patchValue({
      commissionPercentage: this.agreementDetails?.commissionPercentage ? this.agreementDetails?.commissionPercentage.toString() + '%' : '0%',
      directDebitDueDay: this.agreementDetails?.directDebitDueDay ? this.agreementDetails?.directDebitDueDay : '0',
      contractType: this.agreementDetails?.contractType ? this.agreementDetails?.contractType.toString() : '',
      managementType: this.agreementDetails?.managementType ? this.agreementDetails?.managementType.toString() : '',
      totalOccupants: (this.agreementDetails?.totalOccupants ? this.agreementDetails?.totalOccupants : (this.agreementDetails?.noOfOccupiers + this.agreementDetails?.noOfChildren + this.agreementDetails?.noOfPermittedOccupier)),
      tenantName: this.agreementDetails.agreementTenantDetail[0].tenantId,
      rent: this.agreementDetails.agreementTenantDetail[0].rent,
      nextClaimDate: this.agreementDetails.agreementTenantDetail[0].nextClaimDate,
      lastRentRequestDate: this.agreementDetails.agreementTenantDetail[0].lastRentRequestDate,
      renewalRent: this.agreementDetails.agreementTenantDetail[0].renewalRent,
      room: this.agreementDetails.agreementTenantDetail[0].room
    });
  }

  getStatusColorClassName(status: number) {
    let className = '';
    switch (status) {
      case 3:
      case 4:
        className = 'expired';
        break;
      case 2:
      case 6:
        className = 'confirmed';
        break;
      case 1:
      case 5:
        className = 'proposed';
        break;
      default:
        className = 'other-status';
        break;
    }
    return className;
  }

  updateDetails() {
    this.agreementDetailsForm.valueChanges.pipe(
      debounceTime(1000),
      tap(() => {
        this.formStatus = FormStatus.Saving;
        this.commonService.showAutoSaveLoader(this.formStatus);
        this.formChangedValue = this.commonService.getDirtyValues(this.agreementDetailsForm);
        const controlName = Object.keys(this.formChangedValue);
        const controlValue = this.formChangedValue[controlName[0]];
        if (this.dateControl.indexOf(controlName[0]) !== -1)
          this.formChangedValue[controlName[0]] = this.commonService.getFormatedDate(controlValue);

      }),
      switchMap((value) => {
        if (Object.keys(this.formChangedValue).length > 0) {
          return this.agentService.updateAgreementDetails(this.tenant?.agreementId, this.formChangedValue);
        }
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(async (value) => {
      this.agreementDetailsForm.markAsPristine();
      this.agreementDetailsForm.markAsUntouched();
      this.formStatus = FormStatus.Saved;
      this.commonService.showAutoSaveLoader(this.formStatus);
      await this.sleep(2000);
      if (this.formStatus === FormStatus.Saved) {
        this.formStatus = FormStatus.Idle;
        this.commonService.showAutoSaveLoader(this.formStatus);
      }
    }, (error) => {
      this.agreementDetailsForm.markAsPristine();
      this.agreementDetailsForm.markAsUntouched();
      this.formStatus = FormStatus.Idle;
      this.commonService.showAutoSaveLoader(this.formStatus);
      this.updateDetails();
    });
  }

  sleep(ms: number): Promise<any> {
    return new Promise((res) => setTimeout(res, ms));
  }
}

enum FormStatus {
  Saving = 'Saving...',
  Saved = 'Saved!',
  Idle = '',
}