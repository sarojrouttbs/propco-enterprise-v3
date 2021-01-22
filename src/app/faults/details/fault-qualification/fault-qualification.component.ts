import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BranchDetailsModalPage } from 'src/app/shared/modals/branch-details-modal/branch-details-modal.page';
import { CloseFaultModalPage } from 'src/app/shared/modals/close-fault-modal/close-fault-modal.page';
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

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private modalController: ModalController,
    private commonService: CommonService) {
  }

  ngOnInit() {
    this.initFaultQualificationForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.faultDetails && !changes.faultDetails.firstChange) {
      this.initFaultQualificationForm();
    }
  }

  private initFaultQualificationForm(): void {
    this.faultQualificationForm = this.fb.group({
      doesBranchHoldKeys: [],
      isTenantPresenceRequired: [],
      isUnderBlockManagement: [],
      isUnderWarranty: [],
      isUnderServiceContract: []
    });
  }

  radioChecked(type) {
    if (type === 1) {
      if (this.faultQualificationForm.value.doesBranchHoldKeys) {
        this.isManagement = false;
      } else if (!this.faultQualificationForm.value.doesBranchHoldKeys) {
        this.isManagement = true;
      }
    }

    if (type === 2) {
      if (this.faultQualificationForm.value.isTenantPresenceRequired) {
        this.isTenancy = false;
      } else if (!this.faultQualificationForm.value.isTenantPresenceRequired) {
        this.isTenancy = true;
      }
    }

    if (type === 3) {
      if (this.faultQualificationForm.value.isUnderBlockManagement) {
        this.isBlock = false;
      } else if (!this.faultQualificationForm.value.isUnderBlockManagement) {
        this.isBlock = true;
      }
    }

    if (type === 4) {
      if (this.faultQualificationForm.value.isUnderWarranty) {
        this.isGuarantee = false;
      } else if (!this.faultQualificationForm.value.isUnderWarranty) {
        this.isGuarantee = true;
      }
    }

    if (type === 4) {
      if (this.faultQualificationForm.value.isUnderServiceContract) {
        this.isService = false;
      } else if (!this.faultQualificationForm.value.isUnderServiceContract) {
        this.isService = true;
      }
    }
  }

  async viewDetails(type) {
    if (type === 1) {
      await this.getBranchDetails();
    }
  }

  async getBranchDetails() {
    return new Promise((resolve, reject) => {
      this.faultsService.getOfficeDetails(this.propertyDetails.office).subscribe((res) => {
        let data = res ? this.openModal(res) : '';
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
}