import { CERTIFICATES_CATEGORY, PROPCO } from './../../../shared/constants';
import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FAULT_STAGES, FAULT_QUALIFICATION_ACTIONS } from 'src/app/shared/constants';
import { PropertyCertificateModalPage } from 'src/app/shared/modals/property-certificate-modal/property-certificate-modal.page';
import { BranchDetailsModalPage } from 'src/app/shared/modals/branch-details-modal/branch-details-modal.page';
import { CloseFaultModalPage } from 'src/app/shared/modals/close-fault-modal/close-fault-modal.page';
import { TenancyClauseModalPage } from 'src/app/shared/modals/tenancy-clause-modal/tenancy-clause-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { forkJoin } from 'rxjs';
import { BlockManagementModalPage } from 'src/app/shared/modals/block-management-modal/block-management-modal.page';

@Component({
  selector: 'app-fault-qualification',
  templateUrl: './fault-qualification.component.html',
  styleUrls: ['./fault-qualification.component.scss', '../details.page.scss'],
})
export class FaultQualificationComponent implements OnInit {

  @Input() faultDetails: FaultModels.IFaultResponse;
  @Input() propertyDetails;
  @Input() faultCategories;
  faultQualificationForm: FormGroup;
  isManagement = true;
  isTenancy = true;
  isBlock = true;
  isGuarantee = true;
  isService = true;
  isCancelled = true;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  tenancyClauses: any;
  warrantyPropertyCertificate: any;
  serviceContractyPropertyCertificate: any;
  iqfNotification;
  warrantyCertificateId: any = null;
  serviceContractCertificateId: any = null;
  otherStageActions = FAULT_QUALIFICATION_ACTIONS.filter(action => { return (action.index == "LANDLORD_INSTRUCTION") });
  userSelectedActionControl = new FormControl();
  iacStageActions = FAULT_QUALIFICATION_ACTIONS;
  isUserActionChange = false;
  blockManagement: any;
  certificateCategoriesMap: any = new Map();
  CERTIFICATES_CATEGORY = CERTIFICATES_CATEGORY;
  warrantyEmail = null;
  serviceContractEmail = null;
  lookupdata: any;
  certificateTypes: any;

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private modalController: ModalController,
    private commonService: CommonService,
    private router: Router) {
  }

  ngOnInit() {
    this.initFaultQualification();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.faultDetails && !changes.faultDetails.firstChange) {
      this.initFaultQualification();
    }
  }

  initFaultQualification() {
    this.getLookupData();
    this.initFaultQualificationForm();
    this.patchValue();
    this.fetchAgreementsClauses();
    this.getCertificateCategories();
    this.faultNotification(this.faultDetails.stageAction);
    this.getPropertyHeadLease();
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

  private setLookupData(data) {
    this.certificateTypes = data.certificateTypes;
  }

  private async getCertificateCategories() {
    let categories = CERTIFICATES_CATEGORY;
    let apiObservableArray = [];
    if (!categories) return;
    categories.forEach(category => {
      apiObservableArray.push(this.commonService.getSystemConfig(category));
    });
    forkJoin(apiObservableArray).subscribe((res) => {
      if (res) {
        res.forEach((value) => {
          Object.keys(value).forEach(async (index) => {
            this.certificateCategoriesMap.set(index, await this.fetchPropertyCertificates(value[index]));
          });
        });
      }
    });
  }


  private initFaultQualificationForm(): void {
    this.faultQualificationForm = this.fb.group({
      doesBranchHoldKeys: '',
      hasMaintTenancyClause: [],
      isUnderBlockManagement: [],
      isUnderWarranty: [],
      isUnderServiceContract: []
    });
  }

  private patchValue() {
    if (this.faultDetails) {
      this.faultQualificationForm.patchValue({
        doesBranchHoldKeys: this.faultDetails.doesBranchHoldKeys,
        hasMaintTenancyClause: this.faultDetails.hasMaintTenancyClause,
        isUnderBlockManagement: this.faultDetails.isUnderBlockManagement,
        isUnderWarranty: this.faultDetails.isUnderWarranty,
        isUnderServiceContract: this.faultDetails.isUnderServiceContract
      });
    }
  }

  async faultNotification(action) {
    let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
    this.iqfNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.FAULT_QUALIFICATION, action);
  }

  async checkFaultNotifications(faultId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getFaultNotifications(faultId).subscribe(async (response) => {
        let notifications = response && response.data ? response.data : [];
        resolve(notifications);
      }, error => {
        reject(error)
      });
    });
  }

  private filterNotifications(data, stage, action) {
    const promise = new Promise((resolve, reject) => {
      let filtereData = null;
      if (data.length === 0) {
        resolve(null);
      }
      filtereData = data.filter((x => x.faultStage === stage)).filter((x => x.faultStageAction === action)).filter((x => x.isResponseExpected));
      if (filtereData.length === 0) {
        resolve(null);
      }
      filtereData = filtereData.sort((a, b) => {
        return <any>new Date(b.firstEmailSentAt) - <any>new Date(a.firstEmailSentAt);
      });
      if (filtereData && filtereData[0]) {
        resolve(filtereData[0]);
      } else {
        resolve(null);
      }
    });
    return promise;
  }

  async viewBranchDetails() {
    let branchDetails = await this.getBranchDetails();
    if (branchDetails) {
      this.openModal(branchDetails);
    }
  }

  async getBranchDetails() {
    return new Promise((resolve, reject) => {
      this.faultsService.getOfficeDetails(this.propertyDetails.office).subscribe((res) => {
        let data = res ? res : '';
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  async openModal(data) {
    const modal = await this.modalController.create({
      component: BranchDetailsModalPage,
      cssClass: 'modal-container fault-qualification-modal',
      componentProps: {
        branchDetails: data
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async () => {
    });

    await modal.present();
  }

  _btnHandler(type: string) {
    switch (type) {
      case 'save': {
        this.saveForLater();
        break;
      }
      case 'proceed': {
        this.proceed();
        break;
      }
      default: {
        this.btnAction.emit(type);
        break;
      }
    }
  }

  private async proceed() {
    if (this.iqfNotification && (this.iqfNotification.responseReceived == null || this.iqfNotification.responseReceived?.isAccepted == null)) {
      if (this.isUserActionChange) {
        if (!this.iqfNotification.isVoided) {
          this.commonService.showConfirm('Fault Qualification', 'You have not selected any of the possible options here. Would you like to proceed to the Landlord Instructions stage?', '', 'Yes', 'No').then(async res => {
            if (res) {
              this.voidNotification(null);
            }
          });

        } else {
          this.commonService.showConfirm('Fault Qualification', 'You have not selected any of the possible options here. Would you like to proceed to the Landlord Instructions stage?', '', 'Yes', 'No').then(async res => {
            if (res) {
              this.updateFault(null);
            }
          });

        }
      } else {
        this.commonService.showAlert('Warning', 'Please choose one option to proceed.');
        return;
      }
    } else {
      let qualificationForm = this.faultQualificationForm.value;
      let serviceCounter = 0;
      if (qualificationForm.isUnderBlockManagement) {
        serviceCounter++;
      }
      if (qualificationForm.isUnderWarranty) {
        serviceCounter++;
      }
      if (qualificationForm.isUnderServiceContract) {
        serviceCounter++;
      }

      if (serviceCounter > 1) {
        this.commonService.showAlert('Warning', 'Please choose one option from Block Management/Factors Responsibility, Guarantee/Warranty, and Service Contract.');
        return;
      }

      if (serviceCounter === 1 && qualificationForm.isUnderBlockManagement) {
        if (this.blockManagement.managementCompany.email == null || this.blockManagement.managementCompany.email) {
          this.commonService.showAlert('Warning', 'No valid Email address found.');
          return;
        }
        let response = await this.commonService.showConfirm('Fault Qualification', 'You have selected the Block Management option for this repair. Do you want to send an email to inform the Block Management/Factors Company?', '', 'Yes', 'No');
        if (response) {
          this.saveQualificationDetails(FAULT_STAGES.FAULT_QUALIFICATION, 'UNDER_BLOCK_MANAGEMENT');
        }
      }

      if (serviceCounter === 1 && qualificationForm.isUnderWarranty) {
        if (this.warrantyCertificateId && (this.warrantyEmail == null || this.warrantyEmail == '')) {
          this.commonService.showAlert('Warning', 'No valid Email address found.');
          return;
        }
        if (this.warrantyCertificateId == null || this.warrantyCertificateId == '') {
          this.commonService.showAlert('Warning', 'Please select a Guarantee/Warranty');
          return;
        }
        let response = await this.commonService.showConfirm('Fault Qualification', 'You have selected Guarantee/Warranty option for this repair. Do you want to send an email to inform the Guarantee Management Company?', '', 'Yes', 'No');
        if (response) {
          this.saveQualificationDetails(FAULT_STAGES.FAULT_QUALIFICATION, 'UNDER_WARRANTY');
        }
      }

      if (serviceCounter === 1 && qualificationForm.isUnderServiceContract) {
        if (this.serviceContractCertificateId && (this.serviceContractEmail == null || this.serviceContractEmail == '')) {
          this.commonService.showAlert('Warning', 'No valid Email address found.');
          return;
        }
        if (this.serviceContractCertificateId == null || this.serviceContractCertificateId == '') {
          this.commonService.showAlert('Warning', 'Please select a Service Contract');
          return;
        }
        let response = await this.commonService.showConfirm('Fault Qualification', 'You have selected Service Contract option for this repair. Do you want to send an email to inform the Service Contract Company? ', '', 'Yes', 'No');
        if (response) {
          this.saveQualificationDetails(FAULT_STAGES.FAULT_QUALIFICATION, 'UNDER_SERVICE_CONTRACT');
        }
      }

      if (serviceCounter === 0) {
        this.changeStage();
      }
    }


  }

  private async changeStage() {
    let response = await this.commonService.showConfirm('Fault Qualification', `You have not selected any of the possible options here. Would you like to proceed to the Landlord Instructions stage?".`, '', 'Yes', 'No');
    if (response) {
      this.saveQualificationDetails(FAULT_STAGES.LANDLORD_INSTRUCTION);
    }
  }

  private async saveQualificationDetails(stage: string, stageAction?: string) {
    let qualificationForm = this.faultQualificationForm.value;
    let faultRequestObj = {} as FaultModels.IFaultResponse;
    faultRequestObj.isDraft = false;
    faultRequestObj.doesBranchHoldKeys = qualificationForm.doesBranchHoldKeys;
    faultRequestObj.hasMaintTenancyClause = qualificationForm.hasMaintTenancyClause;
    faultRequestObj.isUnderBlockManagement = qualificationForm.isUnderBlockManagement;
    faultRequestObj.isUnderWarranty = qualificationForm.isUnderWarranty;
    faultRequestObj.isUnderServiceContract = qualificationForm.isUnderServiceContract;
    faultRequestObj.stage = stage;
    faultRequestObj.warrantyCertificateId = this.warrantyCertificateId ? this.warrantyCertificateId : this.faultDetails.warrantyCertificateId;
    faultRequestObj.serviceContractCertificateId = this.serviceContractCertificateId ? this.serviceContractCertificateId : this.faultDetails.serviceContractCertificateId;
    if (stageAction) {
      faultRequestObj.stageAction = stageAction;
    }
    let res = await this.updateFaultDetails(this.faultDetails.faultId, faultRequestObj);

    if (res) {
      this._btnHandler('refresh');
    }
  }

  private async saveForLater() {
    if (this.iqfNotification && (this.iqfNotification.responseReceived == null || this.iqfNotification.responseReceived?.isAccepted == null)) {
      return;
    }
    this.commonService.showLoader();
    let requestObj = {
      doesBranchHoldKeys: this.faultQualificationForm.value.doesBranchHoldKeys,
      hasMaintTenancyClause: this.faultQualificationForm.value.hasMaintTenancyClause,
      isUnderBlockManagement: this.faultQualificationForm.value.isUnderBlockManagement,
      isUnderWarranty: this.faultQualificationForm.value.isUnderWarranty,
      isUnderServiceContract: this.faultQualificationForm.value.isUnderServiceContract,
      stage: this.faultDetails.stage,
      isDraft: true,
      warranrtCertificateId: this.warrantyCertificateId ? this.warrantyCertificateId : this.faultDetails.warrantyCertificateId,
      serviceContractCertificateId: this.serviceContractCertificateId ? this.serviceContractCertificateId : this.faultDetails.serviceContractCertificateId

    };
    this.faultsService.updateFault(this.faultDetails.faultId, requestObj).subscribe(
      () => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Fault details have been updated successfully.', 'Fault Qualification', 'success');
        this.router.navigate(['faults/dashboard'], { replaceUrl: true });
      },
      error => {
        this.commonService.hideLoader();
      }
    );
  }

  async closeFault() {
    const modal = await this.modalController.create({
      component: CloseFaultModalPage,
      cssClass: 'modal-container close-fault-modal',
      componentProps: {
        faultId: this.faultDetails.faultId
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh');
        this.commonService.showMessage('Fault has been closed successfully.', 'Close a Fault', 'success');
        return;
      }
    });

    await modal.present();
  }

  moreInfo() { }

  async viewTenancyClause() {
    const modal = await this.modalController.create({
      component: TenancyClauseModalPage,
      cssClass: 'modal-container tenancy-clause-modal',
      componentProps: {
        tenancyClauses: this.tenancyClauses
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        return;
      }
    });

    await modal.present();
  }

  private fetchAgreementsClauses() {
    if (this.faultDetails.agreementId) {
      const promise = new Promise((resolve) => {
        this.faultsService.fetchAgreementsClauses(this.faultDetails.agreementId).subscribe(
          res => {
            this.tenancyClauses = res ? res : '';
            if (!this.tenancyClauses) {
              this.faultQualificationForm.patchValue({ hasMaintTenancyClause: false });
              this.faultQualificationForm.get('hasMaintTenancyClause').updateValueAndValidity();
            }
            resolve(true);
          },
          () => {
            resolve(false);
          }
        );
      });
      return promise;
    }
  }

  async viewPropertyCertificate(category) {
    const modal = await this.modalController.create({
      component: PropertyCertificateModalPage,
      cssClass: 'modal-container property-certificates-list',
      componentProps: {
        propertyCertificate: category === CERTIFICATES_CATEGORY[0] ? this.certificateCategoriesMap.get(CERTIFICATES_CATEGORY[0]) : this.certificateCategoriesMap.get(CERTIFICATES_CATEGORY[1]),
        certificateId: category === CERTIFICATES_CATEGORY[0] ?
          (this.warrantyCertificateId ? this.warrantyCertificateId : this.faultDetails.warrantyCertificateId) :
          this.serviceContractCertificateId ? this.serviceContractCertificateId : this.faultDetails.serviceContractCertificateId,
        category: category,
        certificateTypes: this.certificateTypes
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && (res.data.certificateId != null || res.data.certificateId != '')) {
        category === CERTIFICATES_CATEGORY[0] ? this.warrantyCertificateId = res.data.certificateId : this.serviceContractCertificateId = res.data.certificateId;
        if (res.data.certificateEmail != null || res.data.certificateEmail != '') {
          category === CERTIFICATES_CATEGORY[0] ? this.warrantyEmail = res.data.certificateEmail : this.serviceContractEmail = res.data.certificateEmail;
        }
      } else {
        category === CERTIFICATES_CATEGORY[0] ? this.faultQualificationForm.get('isUnderWarranty').setValue(false) : this.faultQualificationForm.get('isUnderServiceContract').setValue(false);
      }
    });

    await modal.present();
  }

  viewServiceContract() { }

  private updateFaultDetails(faultId, requestObj): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFault(faultId, requestObj).subscribe(
        () => {
          // this.commonService.showMessage('Fault details have been updated successfully.', 'Fault Summary', 'success');
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
    return promise;
  }

  private fetchPropertyCertificates(category) {
    if (this.faultDetails.propertyId) {
      const params: any = new HttpParams().set('category', category);
      const promise = new Promise((resolve) => {
        this.faultsService.fetchPropertyCertificates(this.faultDetails.propertyId, params).subscribe(
          res => {
            // this.propertyCertificate = res ? res : '';
            // if (!this.propertyCertificate) {
            //   this.faultQualificationForm.patchValue({ isUnderWarranty: false });
            //   this.faultQualificationForm.get('isUnderWarranty').updateValueAndValidity();
            // }
            resolve(res ? res : false);
          },
          () => {
            resolve(false);
          }
        );
      });
      return promise;
    }
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  async questionAction(data) {
    if (this.iqfNotification && this.iqfNotification.responseReceived != null) {
      return;
    }

    if (this.iqfNotification.templateCode === 'GA-E' || this.iqfNotification.templateCode === 'BM-E' || this.iqfNotification.templateCode === 'SM-E') {
      this.questionActionAcceptRequest(data);
    }

  }

  setUserAction(index) {
    this.isUserActionChange = true;
    this.userSelectedActionControl.setValue(index);
  }

  getPendingHours() {
    let hours = 0;
    const currentDateTime = this.commonService.getFormatedDateTime(new Date());
    if (this.iqfNotification.nextChaseDueAt) {
      const diffInMs = Date.parse(this.iqfNotification.nextChaseDueAt) - Date.parse(currentDateTime);
      hours = diffInMs / 1000 / 60 / 60;
    }
    return hours > 0 ? Math.floor(hours) : 0;
  }

  private questionActionAcceptRequest(data) {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isAccepted = data.value;
    notificationObj.submittedByType = 'SECUR_USER';
    let type = '';
    switch (this.iqfNotification.templateCode) {
      case 'GA-E': {
        type = 'Guarantee Management';
        break;
      }
      case 'BM-E': {
        type = 'Block Management/Factors';
        break;
      }
      case 'SM-E': {
        type = 'Service Contract';
        break;
      }
      default: {
        break;
      }
    }
    if (data.value) {
      this.commonService.showConfirm('Repair complete', `Are you sure the ${type} Company has completed the repair?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(notificationObj, this.iqfNotification.faultNotificationId);
          this._btnHandler('refresh');
        }
      });
    } else if (!data.value) {
      this.commonService.showConfirm('Repair not complete', `Are you sure the ${type} Company has not completed the repair`, '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(notificationObj, this.iqfNotification.faultNotificationId);
          this._btnHandler('refresh');
        }
      });
    }
  }

  private async updateFaultNotification(notificationObj, faultNotificationId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateNotification(faultNotificationId, notificationObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  private getPropertyHeadLease() {
    if (this.faultDetails.propertyId) {
      const promise = new Promise((resolve) => {
        this.faultsService.getPropertyHeadLease(this.faultDetails.propertyId).subscribe(
          res => {
            if (res) {
              this.blockManagement = res ? res : '';
              if (!this.blockManagement) {
                this.faultQualificationForm.patchValue({ isUnderBlockManagement: false });
                this.faultQualificationForm.get('isUnderBlockManagement').updateValueAndValidity();
              }
            }
            resolve(true);
          },
          () => {
            resolve(false);
          }
        );
      });
      return promise;
    }
  }

  async viewBlockManagement() {
    const modal = await this.modalController.create({
      component: BlockManagementModalPage,
      cssClass: 'modal-container upload-container',
      componentProps: {
        blockManagement: this.blockManagement,
        faultCategories: this.faultCategories
      },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        return;
      }
    });

    await modal.present();
  }

  async voidNotification(value) {

    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isVoided = true;
    notificationObj.submittedByType = 'SECUR_USER';
    const updated = await this.updateFaultNotification(notificationObj, this.iqfNotification.faultNotificationId);
    if (updated) {
      this.updateFault(value);
    }
  }

  async updateFault(value) {
    let faultRequestObj: any = {};
    faultRequestObj.isDraft = false;
    faultRequestObj.stage = this.userSelectedActionControl.value;
    // faultRequestObj.status = 13; //CHECKING LL INSTRUCTIONS
    const isFaultUpdated = await this.updateFaultDetails(this.faultDetails.faultId, faultRequestObj);
    if (isFaultUpdated) {
      const CHECKING_LANDLORD_INSTRUCTIONS = 13;
      await this.updateFaultStatus(CHECKING_LANDLORD_INSTRUCTIONS);
      if (value) {
        this._btnHandler('cancel');
      } else {
        this._btnHandler('refresh');
      }
    }
  }

  private updateFaultStatus(status): Promise<any> {
    return this.faultsService.updateFaultStatus(this.faultDetails.faultId, status).toPromise();
  }
}
