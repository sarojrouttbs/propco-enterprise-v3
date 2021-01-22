import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ERROR_MESSAGE } from 'src/app/shared/constants';
import { AgreementClauseModalPageModule } from 'src/app/shared/modals/agreement-clause-modal/agreement-clause-modal.module';
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
    private commonService: CommonService) {
  }

  ngOnInit() {
    this.initFaultQualification();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.faultDetails && !changes.faultDetails.firstChange) {
      this.initFaultQualification();
    }
    if (changes.propertyDetails && !changes.propertyDetails.firstChange) {
      this.fetchTenancyClauses();
    }
  }
  
  initFaultQualification() {
    this.initFaultQualificationForm();
    this.fetchAgreementsClauses();
  }

  private initFaultQualificationForm(): void {
    this.faultQualificationForm = this.fb.group({
      doesBranchHoldKeys: '',
      isTenantPresenceRequired: [],
      isUnderBlockManagement: [],
      isUnderWarranty: [],
      isUnderServiceContract: []
    });
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
      if (this.faultQualificationForm.value.isTenantPresenceRequired) {
        this.isTenancy = false;
      } else if (!this.faultQualificationForm.value.isTenantPresenceRequired) {
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

    modal.onDidDismiss().then(async res => {
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

  private async proceed() { }
  private async saveForLater() { }

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

  fetchTenancyClauses() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.fetchTenancyClauses(this.propertyDetails.propertyId).subscribe(
        res => {
          this.tenancyClauses = res ? res : '';
          if (!this.tenancyClauses) {
            this.faultQualificationForm.patchValue({ isTenantPresenceRequired: false });
            this.faultQualificationForm.get('isTenantPresenceRequired').updateValueAndValidity();
          }
          resolve(true);
        },
        error => {
          resolve(false);
        }
      );
    });
    return promise;
  }

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

  fetchAgreementsClauses() {
    if (this.faultDetails.agreementId) {
      const promise = new Promise((resolve, reject) => {
        this.faultsService.fetchAgreementsClauses(this.faultDetails.agreementId).subscribe(
          res => {
            this.agreementClauses = res ? res : '';
            if (!this.agreementClauses) {
              this.faultQualificationForm.patchValue({ isUnderWarranty: false });
              this.faultQualificationForm.get('isUnderWarranty').updateValueAndValidity();
            }
            resolve(true);
          },
          error => {
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
}
