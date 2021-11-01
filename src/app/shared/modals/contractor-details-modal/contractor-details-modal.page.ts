import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';
import { ValidationService } from 'src/app/shared/services/validation.service';
@Component({
  selector: 'app-contractor-details-modal',
  templateUrl: './contractor-details-modal.page.html',
  styleUrls: ['./contractor-details-modal.page.scss'],
})
export class ContractorDetailsModalPage implements OnInit {
  contractorDetailForm: FormGroup;
  faultId;
  landlordId;
  llContractorDetails;
  estimatedVisitAt;
  unSavedData = false;
  minDate;
  pastDateError: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
    const currentDate = new Date();
    this.minDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() - 30), 'yyyy-MM-ddTHH:mm');
    this.initContractorDetailForm();
    if (this.llContractorDetails.landlordOwnContractorId !== null) {
      this.patchValue();
    }
  }

  private initContractorDetailForm(): void {
    this.contractorDetailForm = this.formBuilder.group({
      company: ['', Validators.required],
      name: ['', Validators.required],
      telephone: ['', Validators.required],
      email: ['', [ValidationService.emailValidator]],
      estimatedVisitAt: [''],
      notes: '',
      hasContractorConsent: [false, Validators.requiredTrue]
    });
  }

  private patchValue(): void {
    this.contractorDetailForm.patchValue({
      company: this.llContractorDetails.company,
      name: this.llContractorDetails.name,
      telephone: this.llContractorDetails.telephone,
      email: this.llContractorDetails.email,
      estimatedVisitAt: this.estimatedVisitAt,
      notes: this.llContractorDetails.notes,
      hasContractorConsent: this.llContractorDetails.hasContractorConsent
    });
    if (this.estimatedVisitAt)
      this.contractorDetailForm.disable();
  }

  save() {
    if (this.contractorDetailForm.valid) {
      let requestObj: any = {
        company: this.contractorDetailForm.value.company,
        landlordId: this.landlordId,
        name: this.contractorDetailForm.value.name,
        notes: this.contractorDetailForm.value.notes,
        telephone: this.contractorDetailForm.value.telephone,
        hasContractorConsent: this.contractorDetailForm.value.hasContractorConsent
      }

      this.contractorDetailForm.value.estimatedVisitAt ? requestObj.estimatedVisitAt = this.commonService.getFormatedDate(this.contractorDetailForm.value.estimatedVisitAt, 'yyyy-MM-dd HH:mm:ss') : '';
      this.contractorDetailForm.value.email ? requestObj.email = this.contractorDetailForm.value.email : '';
      this.llContractorDetails.landlordOwnContractorId ? requestObj.landlordOwnContractorId = this.llContractorDetails.landlordOwnContractorId : '';
      const promise = new Promise((resolve, reject) => {
        this.faultsService.saveOwnContractor(this.faultId, requestObj).subscribe(
          res => {
            resolve(true);
            this.modalController.dismiss('success');
          },
          error => {
            resolve(false);
          }
        );
      });
      return promise;
    } else {
      this.contractorDetailForm.markAllAsTouched();
    }

  }

  async onCancel() {
    if ((this.contractorDetailForm.value.company
      || this.contractorDetailForm.value.name
      || this.contractorDetailForm.value.telephone
      || this.contractorDetailForm.value.email
      || this.contractorDetailForm.value.estimatedVisitAt
      || this.contractorDetailForm.value.notes
      || this.contractorDetailForm.value.hasContractorConsent) && this.estimatedVisitAt ==null) {
      this.unSavedData = true;
    } else {
      this.dismiss();
    }
  }

  continue() {
    this.unSavedData = false;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  checkPastDate() {
    if (this.contractorDetailForm.value.estimatedVisitAt <= this.commonService.getFormatedDate(new Date(), 'yyyy-MM-ddTHH:mm')) {
      this.pastDateError = true;
    }
    else {
      this.pastDateError = false;
    }
  }
}
