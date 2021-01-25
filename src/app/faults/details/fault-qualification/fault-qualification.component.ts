import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { FAULT_STAGES } from 'src/app/shared/constants';
import { AgreementClauseModalPage } from 'src/app/shared/modals/agreement-clause-modal/agreement-clause-modal.page';
import { BranchDetailsModalPage } from 'src/app/shared/modals/branch-details-modal/branch-details-modal.page';
import { CloseFaultModalPage } from 'src/app/shared/modals/close-fault-modal/close-fault-modal.page';
import { TenantListModalPage } from 'src/app/shared/modals/tenant-list-modal/tenant-list-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';

@Component({
  selector: 'app-fault-qualification',
  templateUrl: './fault-qualification.component.html',
  styleUrls: ['./fault-qualification.component.scss'],
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
  agreementClauses: any;

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
    if (changes.propertyDetails && !changes.propertyDetails.firstChange) {
      // this.fetchPropertyClauses();
    }
  }

  initFaultQualification() {
    this.initFaultQualificationForm();
    this.patchValue();
    this.fetchAgreementsClauses();
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

  radioChecked(type) {
    if (type === 'management') {
      if (this.faultQualificationForm.value.doesBranchHoldKeys) {
        this.isManagement = false;
      } else if (!this.faultQualificationForm.value.doesBranchHoldKeys) {
        this.isManagement = true;
      }
    }

    if (type === 'tenant') {
      if (this.faultQualificationForm.value.hasMaintTenancyClause) {
        this.isTenancy = false;
      } else if (!this.faultQualificationForm.value.hasMaintTenancyClause) {
        this.isTenancy = true;
      }
    }

    if (type === 'blockManagement') {
      if (this.faultQualificationForm.value.isUnderBlockManagement) {
        this.isBlock = false;
      } else if (!this.faultQualificationForm.value.isUnderBlockManagement) {
        this.isBlock = true;
      }
    }

    if (type === 'warranty') {
      if (this.faultQualificationForm.value.isUnderWarranty) {
        this.isGuarantee = false;
      } else if (!this.faultQualificationForm.value.isUnderWarranty) {
        this.isGuarantee = true;
      }
    }

    if (type === 'service') {
      if (this.faultQualificationForm.value.isUnderServiceContract) {
        this.isService = false;
      } else if (!this.faultQualificationForm.value.isUnderServiceContract) {
        this.isService = true;
      }
    }
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

    let response = await this.commonService.showConfirm('Fault Qualification', `This will change the fault status to "Checking Landlord Instructions". <br/> Are you sure?`, '', 'Yes', 'No');
    let faultRequestObj = {} as FaultModels.IFaultResponse;
    faultRequestObj.isDraft = false;
    if (response) {
      faultRequestObj.doesBranchHoldKeys = qualificationForm.doesBranchHoldKeys;
      faultRequestObj.hasMaintTenancyClause = qualificationForm.hasMaintTenancyClause;
      faultRequestObj.isUnderBlockManagement = qualificationForm.isUnderBlockManagement;
      faultRequestObj.isUnderWarranty = qualificationForm.isUnderWarranty;
      faultRequestObj.isUnderServiceContract = qualificationForm.isUnderServiceContract;
      faultRequestObj.stage = FAULT_STAGES.LANDLORD_INSTRUCTION;
      let res = await this.updateFaultDetails(this.faultDetails.faultId, faultRequestObj);
      
      if (res) {
        this._btnHandler('refresh');
      }
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
      isDraft: true
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

  // private fetchPropertyClauses() {
  //   const promise = new Promise((resolve, reject) => {
  //     this.faultsService.fetchPropertyClauses(this.propertyDetails.propertyId).subscribe(
  //       res => {
  //         this.tenancyClauses = res ? res : '';
  //         if (!this.tenancyClauses) {
  //           this.faultQualificationForm.patchValue({ hasMaintTenancyClause: false });
  //           this.faultQualificationForm.get('hasMaintTenancyClause').updateValueAndValidity();
  //         }
  //         resolve(true);
  //       },
  //       error => {
  //         resolve(false);
  //       }
  //     );
  //   });
  //   return promise;
  // }

  async viewTenancyClause() {
    const modal = await this.modalController.create({
      component: TenantListModalPage,
      cssClass: 'modal-container',
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

  async viewAgreementClause() {
    const modal = await this.modalController.create({
      component: AgreementClauseModalPage,
      cssClass: 'modal-container',
      componentProps: {
        agreementClauses: this.agreementClauses
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

  viewBlockManagement() { }
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

}
