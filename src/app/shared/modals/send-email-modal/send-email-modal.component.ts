import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { FAULT_STATUSES, LL_INSTRUCTION_TYPES, MAINTENANCE_TYPES, PROPERTY_LINK_STATUS, RECIPIENT, RECIPIENTS, MAINTENANCE_TYPES_FOR_SEND_EMAIL, FAULT_STAGES, SYSTEM_CONFIG, NGX_QUILL_EDITOR_TOOLBAR_SETTINGS } from '../../constants';
import { CommonService } from '../../services/common.service';
import { SendEmailService } from './send-email-modal.service';

@Component({
  selector: 'app-send-email-modal',
  templateUrl: './send-email-modal.component.html',
  styleUrls: ['./send-email-modal.component.scss'],
})
export class SendEmailModalPage implements OnInit, AfterViewChecked {
  quillEditorToolbar = NGX_QUILL_EDITOR_TOOLBAR_SETTINGS;  // ngx-quill editor toolbar config

  faultDetails;
  propertyDetails;
  faultCategoryName;

  sendEmailForm: FormGroup;
  selectedRecipient: any = '';

  isLandlord: boolean = false;
  isTenant: boolean = false;
  isContractor: boolean = false;

  landLordList: any = [];
  tenantList: any = [];
  coTenantList: any = [];
  leadTenantList: any = [];
  contractorListPrefSupplier: any = [];
  contractorsListQuote: any = [];
  contractorsListWorksOrder: any = [];
  contractorsListEstimated: any = [];

  showLoader: boolean = false;
  currentMaintainanceType: string;
  maintainanceTypes = MAINTENANCE_TYPES_FOR_SEND_EMAIL;
  recipient = RECIPIENT;
  faultStages = FAULT_STAGES;
  faultOverrideCommConsent;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private faultsService: FaultsService,
    private changeDetector: ChangeDetectorRef,
    private sendEmailService: SendEmailService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initData();
  }

  private async initData() {
    this.selectedRecipient = '';
    this.initForm();
    this.setMaintainanceType();
    this.initAPI();
  }

  private setMaintainanceType() {
    if (this.faultDetails.stage === FAULT_STAGES.JOB_COMPLETION || this.faultDetails.stage === FAULT_STAGES.PAYMENT || (this.faultDetails.stage === FAULT_STAGES.ARRANGING_CONTRACTOR && (this.faultDetails.stageAction === LL_INSTRUCTION_TYPES[1].index || this.faultDetails.status === FAULT_STATUSES.WORKSORDER_PENDING))) {
      this.currentMaintainanceType = MAINTENANCE_TYPES_FOR_SEND_EMAIL.WO;
    } else if (this.faultDetails.stage === FAULT_STAGES.LANDLORD_INSTRUCTION && (this.faultDetails.stageAction === LL_INSTRUCTION_TYPES[3].index || this.faultDetails.stageAction === LL_INSTRUCTION_TYPES[4].index)) {
      this.currentMaintainanceType = MAINTENANCE_TYPES_FOR_SEND_EMAIL.ESTIMATE;
    } else if (this.faultDetails.stage === FAULT_STAGES.ARRANGING_CONTRACTOR && (this.faultDetails.stageAction === LL_INSTRUCTION_TYPES[2].index || this.faultDetails.stageAction === LL_INSTRUCTION_TYPES[3].index || this.faultDetails.status === FAULT_STATUSES.QUOTE_PENDING)) {
      this.currentMaintainanceType = MAINTENANCE_TYPES_FOR_SEND_EMAIL.QUOTE;
    }
  }

  private async initAPI() {
    const faultOverrideCommsConsent = await this.getSystemConfigs(SYSTEM_CONFIG.FAULT_OVERRIDE_COMMUNICATION_CONSENT);
    this.faultOverrideCommConsent = faultOverrideCommsConsent.FAULT_OVERRIDE_COMMUNICATION_CONSENT;
  }

  ngAfterViewChecked(): void {
    this.changeDetector.detectChanges();
  }

  private initForm() {
    this.sendEmailForm = this.formBuilder.group({
      entityType: ['', Validators.required],
      entityId: this.formBuilder.array([]),
      emailSubject: [((this.propertyDetails?.address?.addressLine1 ? this.propertyDetails?.address?.addressLine1 : '') + (this.faultCategoryName ? ':' + this.faultCategoryName : '')), [Validators.required, Validators.maxLength(255)]],
      emailBody: ['', Validators.required]
    });
  }

  onRecipientClick(recipient) {
    this.selectedRecipient = recipient;
    this.isLandlord = false;
    this.isTenant = false;
    this.isContractor = false;
    if (recipient === RECIPIENTS.LANDLORD) {
      this.initLLData();
    };
    if (recipient === RECIPIENTS.TENANT) {
      this.initTTData();
    };
    if (recipient === RECIPIENTS.CONTRACTOR) {
      this.initCCData();
    };
  }

  private async initLLData() {
    if (!this.landLordList || this.landLordList.length <= 0 || this.landLordList === []) {
      await this.getLandlordDetails();
    } else {
      this.isLandlord = true;
    }
  }

  private async initTTData() {
    if (!this.tenantList || this.tenantList.length <= 0 || this.tenantList === []) {
      await this.getTenantList();
    } else {
      this.isTenant = true;
    }
  }

  private async initCCData() {
    if (this.contractorListPrefSupplier.length == 0) {
      await this.getLandlordDetails();
    } else {
      await this.checkContractorMaintainanceType();
      this.isContractor = true;
    }
  }

  get recipientArray(): FormArray {
    return this.sendEmailForm.controls.entityId as FormArray;
  }

  private async getLandlordDetails() {
    this.landLordList = await this.getLandlordList();
    this.landLordList.forEach(async (item) => {
      const llDppDetails = await this.getLandlordDppDetails(item.landlordId);
      const llDppDetailsWithConsentMatch = llDppDetails.data.find(dppDetails => (dppDetails.dppId === this.faultOverrideCommConsent));
      item.isOverrideCommsPreference = llDppDetailsWithConsentMatch.isOptIn;
      item.isChecked = false;
    });
    this.isLandlord = true;
    if (this.selectedRecipient === RECIPIENTS.CONTRACTOR) {
      this.isLandlord = false;
      if (this.landLordList.length > 0) {
        const landlordId = await this.getLandlordId();
        this.contractorListPrefSupplier = await this.getPreferredContractorList(landlordId);
        await this.setPrefferedContractors();
      }
      await this.checkContractorMaintainanceType();
      this.isContractor = true;
    }
  }

  private async getLandlordList() {
    return new Promise((resolve, reject) => {
      this.faultsService.getLandlordsOfProperty(this.propertyDetails.propertyId).subscribe(
        async (res) => {
          const llList = res && res.data ? res.data.filter((llDetail => (llDetail.propertyLinkStatus === PROPERTY_LINK_STATUS.CURRENT) && (llDetail.status === 1 || llDetail.status === 3))) : [];
          return resolve(llList);
        }
      )
    });
  }

  private async getMaxRentShareLandlord(landlords) {
    let maxRent = 0;
    let mLandlord;
    landlords.forEach(landlord => {
      if (landlord.rentPercentage > maxRent) {
        maxRent = landlord.rentPercentage;
        mLandlord = landlord;
      }
    });
    return mLandlord;
  }

  private async getLandlordId() {
    let landlordId;
    if (this.landLordList.length > 1) {
      let landlord = await this.getMaxRentShareLandlord(this.landLordList);
      landlordId = landlord.landlordId
    } else {
      landlordId = this.landLordList[0]?.landlordId;
    }
    return landlordId;
  }

  private async getTenantList() {
    this.faultsService.getPropertyTenancies(this.propertyDetails.propertyId).subscribe(
      async (res) => {
        this.tenantList = res && res.data ? res.data.filter((ttDetail => (ttDetail.hasCheckedIn === true))) : [];

        if (this.tenantList.length > 0) {
          this.tenantList = await this.getTenantDetails(this.tenantList);
          await this.setLeadCoLeadTenants();
        }
        this.isTenant = true;
      }
    );
  }

  private async getTenantDetails(tenantDetails) {
    const tenantList = tenantDetails;
    tenantList.forEach(element => {
      element.tenants.forEach(async (item) => {
        const tenant: any = await this.getSingleTenantDetails(item.tenantId);
        item.fullName = tenant.fullName;
        item.email = tenant.email;
      });
    });
    return tenantList;
  }

  private async getSingleTenantDetails(tenantId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getTenantDetails(tenantId).subscribe((res) => {
        return resolve(res ? res : {});
      });
    });
  }

  private async setLeadCoLeadTenants() {
    const tenantList = this.tenantList;
    this.leadTenantList = [];
    this.coTenantList = [];
    tenantList.forEach(element => {
      element.tenants.forEach(item => {
        const obj = {
          hasCheckedIn: element.hasCheckedIn,
          tenant: item,
          isChecked: false
        };
        (item.isLead) ? this.leadTenantList.push(obj) : this.coTenantList.push(obj);
      });
    });
  }

  private async getPreferredContractorList(landlordId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getPreferredSuppliers(landlordId).subscribe(
        async (res) => {
          return resolve(res ? res.data : []);
        }
      );
    });
  }

  private async setPrefferedContractors() {
    this.contractorListPrefSupplier.forEach(async (item) => {
      item.isChecked = false;
      const ccDetails: any = await this.getSingleContractorDetails(item.contractorId);
      item.fullName = ccDetails.fullName;
      item.email = ccDetails.email;
    });
  }

  private async checkContractorMaintainanceType() {
    if (this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.ESTIMATE) {
      if (this.contractorsListEstimated.length === 0) {
        await this.setEstimatedContractor();
      }
    } else if (this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.QUOTE) {
      if (this.contractorsListQuote.length === 0) {
        await this.getQuoteContractorList();
      }
    } else if (this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.WO) {
      if (this.contractorsListWorksOrder.length === 0) {
        await this.getQuoteContractorList();
      }
    }
  }

  private getFaultMaintenance(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const params: any = new HttpParams().set('showCancelled', 'true');
      this.faultsService.getQuoteDetails(this.faultDetails.faultId, params).subscribe((res) => {
        resolve(res ? res.data[0] : {});
      }, error => {
        resolve(false);
      });
    });
    return promise;
  }

  private async getQuoteContractorList() {
    const faultMaintenance = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (faultMaintenance.itemType === MAINTENANCE_TYPES.QUOTE) {
      await this.setQuoteContractors(faultMaintenance);
    }
    if (faultMaintenance.itemType === MAINTENANCE_TYPES.WORKS_ORDER) {
      await this.setWOContractors(faultMaintenance);
    }
  }

  private getSingleContractorDetails(contractorId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.faultsService.getContractorDetails(contractorId).subscribe((res) => {
        return resolve(res ? res : {});
      });
    });
  }

  onCheckbox(event: any) {
    if (event.target.checked) this.recipientArray.clear();
  }

  onCheckboxClick(event: any, obj, type, entityType) {
    obj.isChecked = event.target.checked;
    this.sendEmailForm.controls.entityType.setValue(entityType);
    if (event.target.checked) {
      if (type == 'landlord') {
        this.landLordList.forEach(ele => {
          if (ele?.landlordId != obj?.landlordId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.landlordId, recipientName: obj?.fullName, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'leadTenant') {
        this.leadTenantList.forEach(ele => {
          if (ele?.tenant?.tenantId != obj?.tenant?.tenantId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.tenant?.tenantId, recipientName: obj?.tenant?.fullName, recipientEmail: obj?.tenant?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'coTenant') {
        this.coTenantList.forEach(ele => {
          if (ele?.tenant?.tenantId != obj?.tenant?.tenantId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.tenant?.tenantId, recipientName: obj?.tenant?.fullName, recipientEmail: obj?.tenant?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'preferred_supplier') {
        this.contractorListPrefSupplier.forEach(ele => {
          if (ele.contractorId != obj?.contractorId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.contractorId, recipientName: obj?.company, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'estimate_contractor') {
        this.contractorsListEstimated.forEach(ele => {
          if (ele.contractorId != obj?.contractorId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.contractorId, recipientName: obj?.companyName, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'quote_contractor') {
        this.contractorsListQuote.forEach(ele => {
          if (ele.contractorId != obj?.contractorId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.contractorId, recipientName: obj?.company, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'wo_contractor') {
        this.contractorsListWorksOrder.forEach(ele => {
          if (ele.contractorId != obj?.contractorId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.contractorId, recipientName: obj?.companyName, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }
    }
    this.checkRecipientError();
  }

  private resetAllCheck(type) {
    if (type !== 'landlord') {
      this.landLordList.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'leadTenant') {
      this.leadTenantList.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'coTenant') {
      this.coTenantList.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'preferred_supplier') {
      this.contractorListPrefSupplier.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'estimate_contractor') {
      this.contractorsListEstimated.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'quote_contractor') {
      this.contractorsListQuote.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'wo_contractor') {
      this.contractorsListWorksOrder.forEach(element => {
        element.isChecked = false;
      });
    }
  }

  private checkRecipientError() {
    if (this.sendEmailForm.controls['entityId']?.value?.length === 0) {
      this.sendEmailForm.controls['entityId'].setErrors({ requiredError: true });
    } else {
      this.sendEmailForm.controls['entityId'].setErrors(null);
    }
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  sendMail() {
    this.showLoader = true;
    if (this.sendEmailForm.valid) {
      let requestObj = {
        emailBody: this.replaceAllWithAlign(this.sendEmailForm.controls['emailBody'].value),
        emailSubject: this.sendEmailForm.controls['emailSubject'].value,
        entityId: this.sendEmailForm.controls['entityId'].value[0].id,
        entityType: this.sendEmailForm.controls['entityType'].value,
        submittedById: '',
        submittedByType: 'SECUR_USER'
      };
      this.sendEmailService.sendEmail(this.faultDetails.faultId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          this.modalController.dismiss('success');
        },
        error => {
          this.showLoader = false;
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Send email error', 'error');
        }
      );
    } else {
      this.showLoader = false;
      this.sendEmailForm.markAllAsTouched();
      this.checkRecipientError();
    }
  }

  private async setEstimatedContractor() {
    const estimateContractorsList = [];
    const ccDetails: any = await this.getSingleContractorDetails(this.faultDetails.contractorId);
    ccDetails.isChecked = false;
    estimateContractorsList.push(ccDetails);
    estimateContractorsList.forEach(element => {
      this.contractorListPrefSupplier.forEach((item, index) => {
        if (item.contractorId === element.contractorId) this.contractorListPrefSupplier.splice(index, 1);
      });
    });
    this.contractorsListEstimated = [...estimateContractorsList];
  }

  private async setQuoteContractors(faultMaintenance) {
    const quoteContractorsList = faultMaintenance?.quoteContractors ? faultMaintenance?.quoteContractors.filter(ccDetail => (ccDetail.isRejected === false)) : [];
    quoteContractorsList.forEach(element => {
      element.isChecked = false;
      this.contractorListPrefSupplier.forEach((item, index) => {
        if (item.contractorId === element.contractorId) this.contractorListPrefSupplier.splice(index, 1);
      });
    });
    this.contractorsListQuote = [...quoteContractorsList];
  }

  private async setWOContractors(faultMaintenance) {
    const woContractorsList = [];
    const ccDetails: any = await this.getSingleContractorDetails(faultMaintenance.contractorId);
    ccDetails.isChecked = false;
    woContractorsList.push(ccDetails);
    woContractorsList.forEach(element => {
      this.contractorListPrefSupplier.forEach((item, index) => {
        if (item.contractorId === element.contractorId) this.contractorListPrefSupplier.splice(index, 1);
      });
    });
    this.contractorsListWorksOrder = [...woContractorsList];
  }

  private async getSystemConfigs(key): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(res);
      }, error => {
        resolve(true);
      });
    });
    return promise;
  }

  private getLandlordDppDetails(landlordId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.faultsService.getLandlordDppDetails(landlordId).subscribe((res) => {
        return resolve(res ? res : {});
      });
    });
  }

  private replaceAllWithAlign(emailBody) {
    const mapObj = {
      'class="ql-align-justify"': 'style="text-align:justify;"',
      'class="ql-align-left"': 'style="text-align:left;"',
      'class="ql-align-right"': 'style="text-align:right;"',
      'class="ql-align-center"': 'style="text-align:center;"',
    };
    return emailBody.replace(/class="ql-align-justify"|class="ql-align-left"|class="ql-align-right"|class="ql-align-center"/gi, matched => mapObj[matched]);
  }
}
