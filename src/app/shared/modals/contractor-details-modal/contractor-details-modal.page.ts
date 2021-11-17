import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';
import { ValidationService } from 'src/app/shared/services/validation.service';
import { DATE_TIME_TYPES, DATE_TIME_TYPES_KEYS, PROPCO } from '../../constants';
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

  dateTimeTypeList = DATE_TIME_TYPES;
  isDateWithTime: boolean = false;
  isDateWithSession: boolean = false;
  sessionSlots: any;
  pastDateErrorWithSession: boolean = false;
  estimatedVisitSlot;

  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
    const currentDate = new Date();
    this.minDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() - 30), 'yyyy-MM-ddTHH:mm');
    if(this.commonService.getItem(PROPCO.FAULTS_LOOKUP_DATA, true)) {
      this.sessionSlots = (this.commonService.getItem(PROPCO.FAULTS_LOOKUP_DATA, true)).faultContractorPropertyVisitSlots;
      this.sessionSlots = this.commonService.sortBy('index', this.sessionSlots)
    }
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
      hasContractorConsent: [false, Validators.requiredTrue],
      dateTimeType: [''],
      estimatedVisitSlot: ['']
    });
  }

  private patchValue(): void {
    this.contractorDetailForm.patchValue({
      company: this.llContractorDetails.company,
      name: this.llContractorDetails.name,
      telephone: this.llContractorDetails.telephone,
      email: this.llContractorDetails.email,
      notes: this.llContractorDetails.notes,
      hasContractorConsent: this.llContractorDetails.hasContractorConsent,
      dateTimeType: this.estimatedVisitSlot ? DATE_TIME_TYPES_KEYS.DATE_WITH_SESSION : DATE_TIME_TYPES_KEYS.DATE_WITH_TIME
    });
    this.onDateTimeTypeSelection();    
    this.contractorDetailForm.get('estimatedVisitAt').patchValue(this.estimatedVisitAt);
    this.contractorDetailForm.get('estimatedVisitSlot').patchValue(this.estimatedVisitSlot ? this.sessionSlots.filter( item => this.estimatedVisitSlot === item.index)[0] : '');
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
      };

      if(this.contractorDetailForm.get('dateTimeType').value === DATE_TIME_TYPES_KEYS.DATE_WITH_TIME) {
        this.contractorDetailForm.value.estimatedVisitAt ? requestObj.estimatedVisitAt = this.commonService.getFormatedDate(this.contractorDetailForm.value.estimatedVisitAt, 'yyyy-MM-dd HH:mm:ss') : '';  
      }
      if(this.contractorDetailForm.get('dateTimeType').value === DATE_TIME_TYPES_KEYS.DATE_WITH_SESSION) {
        if(this.contractorDetailForm.value?.estimatedVisitAt && this.contractorDetailForm.value?.estimatedVisitSlot) {
          this.contractorDetailForm.value.estimatedVisitAt ? requestObj.estimatedVisitAt = this.commonService.getFormatedDate(this.contractorDetailForm.value.estimatedVisitAt, 'yyyy-MM-dd HH:mm:ss') : '';
          (this.contractorDetailForm.value?.estimatedVisitSlot) ? requestObj.estimatedVisitSlot = this.contractorDetailForm.value.estimatedVisitSlot.index : '';
        }
      }
      
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
    if (new Date(this.contractorDetailForm.value.estimatedVisitAt) < new Date(this.commonService.getFormatedDate(new Date(), 'yyyy-MM-ddTHH:mm'))) {
      this.pastDateError = true;
    }
    else {
      this.pastDateError = false;
    }
  }

  checkPastDateWithSession() {
    if(this.contractorDetailForm.value?.estimatedVisitSlot && this.contractorDetailForm.value?.estimatedVisitAt) {
      const estimatedVisitSlotTime = this.contractorDetailForm.value.estimatedVisitSlot.value.split(',')[1];
      const estimatedVisitSlotEndTime = (estimatedVisitSlotTime.split('-')[1]).split(':')
      const finalDateTime = new Date(this.contractorDetailForm.value.estimatedVisitAt).setHours(estimatedVisitSlotEndTime[0], estimatedVisitSlotEndTime[1]);
      if(finalDateTime) this.contractorDetailForm.get('estimatedVisitAt').setValue(this.commonService.getFormatedDate(finalDateTime,'yyyy-MM-ddTHH:mm'));
      if (new Date(this.contractorDetailForm.value.estimatedVisitAt) <= new Date(this.commonService.getFormatedDate(new Date(), 'yyyy-MM-ddTHH:mm'))) {
        this.pastDateErrorWithSession = true;
      } else {
        this.pastDateErrorWithSession = false;
      }
    }
  }

  onDateTimeTypeSelection() {
    this.pastDateError = false;
    this.pastDateErrorWithSession = false;
    this.isDateWithSession = false;
    this.isDateWithTime = false;
    this.contractorDetailForm.get('estimatedVisitAt').reset();
    this.contractorDetailForm.get('estimatedVisitSlot').reset();
    if(this.contractorDetailForm.get('dateTimeType').value === DATE_TIME_TYPES_KEYS.DATE_WITH_TIME) {
      this.isDateWithTime = true;
      this.contractorDetailForm.get('estimatedVisitAt').reset();
    }
    if(this.contractorDetailForm.get('dateTimeType').value === DATE_TIME_TYPES_KEYS.DATE_WITH_SESSION) {
      this.isDateWithSession = true;
      this.contractorDetailForm.get('estimatedVisitAt').reset();
      this.contractorDetailForm.get('estimatedVisitSlot').reset();
    }
  }
}
