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
  currentDate = this.commonService.getFormatedDate(new Date());

  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
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
      notes: ''
    });
  }

  private patchValue(): void {
    this.contractorDetailForm.patchValue({
      company: this.llContractorDetails.company,
      name: this.llContractorDetails.name,
      telephone: this.llContractorDetails.telephone,
      email: this.llContractorDetails.email,
      estimatedVisitAt: this.llContractorDetails.estimatedVisitAt,
      notes: this.llContractorDetails.notes
    });
    // this.contractorDetailForm.disable();
  }

  save() {
    if (this.contractorDetailForm.valid) {
      let requestObj: any = {
        company: this.contractorDetailForm.value.company,
        landlordId: this.landlordId,
        name: this.contractorDetailForm.value.name,
        notes: this.contractorDetailForm.value.notes,
        telephone: this.contractorDetailForm.value.telephone
      }

      this.contractorDetailForm.value.estimatedVisitAt ? requestObj.estimatedVisitAt = this.contractorDetailForm.value.estimatedVisitAt : '';
      this.contractorDetailForm.value.email ? requestObj.email = this.contractorDetailForm.value.email : '';

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

  dismiss() {
    this.modalController.dismiss();
  }
}
