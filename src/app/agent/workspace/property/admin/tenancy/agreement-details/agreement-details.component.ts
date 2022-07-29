import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DATE_FORMAT, DEFAULTS, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { AgentService } from 'src/app/agent/agent.service';

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

  constructor(private agentService: AgentService, private _formBuilder: FormBuilder, private commonService: CommonService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedTenant && changes.selectedTenant.currentValue) {
      this.selectedTenant = this.selectedTenant;
      this.initAgreementDetailsAPI();
    }
  }

  ngOnInit() {
    this.rentFrequencyList.shift();
    this.initAPI();
  }

  private initAPI() {
    this.getLookupData();
    this.creatForm();
  }

  private async initAgreementDetailsAPI() {
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
      totalOccupants: [],
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
    return new Promise((resolve, _reject) => {
      this.agentService.getAgreementDetails(this.selectedTenant?.agreementId).subscribe(
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
      commissionPercentage: this.agreementDetails?.commissionPercentage ? this.agreementDetails?.commissionPercentage.toString() : '0',
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
}
