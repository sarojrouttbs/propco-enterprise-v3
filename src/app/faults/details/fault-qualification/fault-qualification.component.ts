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

@Component({
  selector: 'app-fault-qualification',
  templateUrl: './fault-qualification.component.html',
  styleUrls: ['./fault-qualification.component.scss', '../details.page.scss'],
})
export class FaultQualificationComponent implements OnInit {

  @Input() faultDetails: FaultModels.IFaultResponse;
  @Input() propertyDetails;
  faultQualificationForm: FormGroup;
  isManagement = true;
  isTenancy = true;
  isBlock = true;
  isGuarantee = true;
  isService = true;
  isCancelled = true;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  tenancyClauses: any;
  propertyCertificate: any;
  iacNotification;
  warranrtCertificateId: any;
  otherStageActions = FAULT_QUALIFICATION_ACTIONS.filter(action => { return (action.index == "LANDLORD_INSTRUCTION") });
  userSelectedActionControl = new FormControl();
  iacStageActions = FAULT_QUALIFICATION_ACTIONS;
  isUserActionChange = false;
  blockManagement: any;

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
    this.initFaultQualificationForm();
    this.patchValue();
    this.fetchAgreementsClauses();
    this.fetchPropertyCertificates();
    this.faultNotification(this.faultDetails.stageAction);
    this.getPropertyHeadLease();
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
    this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.FAULT_QUALIFICATION, action);
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
      filtereData = data.filter((x => x.faultStage === stage)).filter((x => x.faultStageAction === action));
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
      let response = await this.commonService.showConfirm('Fault Qualification', 'You have selected the Block Management option for this repair. Do you want to send an email to inform the Block Management/Factors Company?', '', 'Yes', 'No');
      if (response) {
        this.saveQualificationDetails(FAULT_STAGES.FAULT_QUALIFICATION, 'UNDER_BLOCK_MANAGEMENT');
      }
    }

    if (serviceCounter === 1 && qualificationForm.isUnderWarranty) {
      let response = await this.commonService.showConfirm('Fault Qualification', 'You have selected Guarantee/Warranty option for this repair. Do you want to send an email to inform the Guarantee Management Company?', '', 'Yes', 'No');
      if (response) {
        this.saveQualificationDetails(FAULT_STAGES.FAULT_QUALIFICATION, 'UNDER_WARRANTY');
      }
    }

    if (serviceCounter === 1 && qualificationForm.isUnderServiceContract) {
      let response = await this.commonService.showConfirm('Fault Qualification', 'You have selected Service Contract? option for this repair. Do you want to send an email to inform the Service Contract Company? ', '', 'Yes', 'No');
      if (response) {
        this.saveQualificationDetails(FAULT_STAGES.FAULT_QUALIFICATION, 'UNDER_SERVICE_CONTRACT');
      }
    }

    if (serviceCounter === 0) {
      this.changeStage();
    }
  }

  private async changeStage() {
    let response = await this.commonService.showConfirm('Fault Qualification', `This will change the fault status to "Checking Landlord Instructions". <br/> Are you sure?`, '', 'Yes', 'No');
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
    // faultRequestObj.warrantyCertificateId = 24087;
    faultRequestObj.warrantyCertificateId = this.warranrtCertificateId;
    if (stageAction) {
      faultRequestObj.stageAction = stageAction;
    }
    let res = await this.updateFaultDetails(this.faultDetails.faultId, faultRequestObj);

    if (res) {
      // this.faultNotification();
      this._btnHandler('refresh');
    }
  }

  private async saveForLater() {
    this.commonService.showLoader();
    let requestObj = {
      doesBranchHoldKeys: this.faultQualificationForm.value.doesBranchHoldKeys,
      hasMaintTenancyClause: this.faultQualificationForm.value.hasMaintTenancyClause,
      isUnderBlockManagement: this.faultQualificationForm.value.isUnderBlockManagement,
      isUnderWarranty: this.faultQualificationForm.value.isUnderWarranty,
      isUnderServiceContract: this.faultQualificationForm.value.isUnderServiceContract,
      stage: this.faultDetails.stage,
      isDraft: true,
      warrantyCertificateId: this.warranrtCertificateId,

    };
    this.faultsService.updateFault(this.faultDetails.faultId, requestObj).subscribe(
      () => {
        this.commonService.hideLoader();
        this.commonService.showMessage('Fault details have been updated successfully.', 'Fault Qualification', 'success');
        this.router.navigate(['faults/dashboard'], { replaceUrl: true });
      },
      error => {
        this.commonService.hideLoader();
        console.log(error);
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

  async viewPropertyCertificate() {
    const modal = await this.modalController.create({
      component: PropertyCertificateModalPage,
      cssClass: 'modal-container property-certificates-list',
      componentProps: {
        propertyCertificate: this.propertyCertificate,
        warranrtCertificateId: this.warranrtCertificateId
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

  private fetchPropertyCertificates() {
    if (this.faultDetails.propertyId) {
      const promise = new Promise((resolve) => {
        this.faultsService.fetchPropertyCertificates(this.faultDetails.propertyId).subscribe(
          res => {
            this.propertyCertificate = res ? res : '';
            if (!this.propertyCertificate) {
              this.faultQualificationForm.patchValue({ isUnderWarranty: false });
              this.faultQualificationForm.get('isUnderWarranty').updateValueAndValidity();
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

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  async questionAction(data) {
    if (this.iacNotification && this.iacNotification.responseReceived != null) {
      return;
    }

    if (this.iacNotification.templateCode === 'GA-E') {
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
    if (this.iacNotification.nextChaseDueAt) {
      const diffInMs = Date.parse(this.iacNotification.nextChaseDueAt) - Date.parse(currentDateTime);
      hours = diffInMs / 1000 / 60 / 60;
    }
    return hours > 0 ? Math.floor(hours) : 0;
  }

  private questionActionAcceptRequest(data) {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isAccepted = data.value;
    notificationObj.submittedByType = 'SECUR_USER';
    if (data.value) {
      this.commonService.showConfirm('Repair complete', 'Are you sure the Guarantee Management Company has completed the repair?', '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
          this._btnHandler('refresh');
        }
      });
    } else if (!data.value) {
      this.commonService.showConfirm('Repair not complete', 'Are you sure the Guarantee Management Company has not completed the repair', '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
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
    // const modal = await this.modalController.create({
    //   component: BlockManagementModalPage,
    //   cssClass: 'modal-container upload-container',
    //   componentProps: {
    //     blockManagement: this.blockManagement,
    //   },
    //   backdropDismiss: false
    // });
    // modal.onDidDismiss().then(async res => {
    //   if (res.data && res.data == 'success') {
    //     return;
    //   }
    // });

    // await modal.present();
  }

}
