import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { APPOINTMENT_MODAL_TYPE, DATE_FORMAT, DATE_TIME_TYPES, DATE_TIME_TYPES_KEYS, PROPCO } from '../../constants';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.page.html',
  styleUrls: ['./appointment-modal.page.scss'],
})
export class AppointmentModalPage implements OnInit {
  appointmentForm: FormGroup;
  faultId;
  faultNotificationId;
  title;
  headingOne;
  headingTwo;
  minDate;
  type;
  futureDate;
  showLoader = false;
  unSavedData = false;
  contractorDetails;
  contractorWoPropertyVisitAt;
  contractorWoPropertyVisitSlot;
  pastDateError = false;

  dateTimeTypeList = DATE_TIME_TYPES;
  isDateWithTime = false;
  isDateWithSession = false;
  sessionSlots: any;
  pastDateErrorWithSession = false;
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) { }

  ngOnInit() {
    const currentDate = new Date();
    if (this.commonService.getItem(PROPCO.FAULTS_LOOKUP_DATA, true)) {
      this.sessionSlots = (this.commonService.getItem(PROPCO.FAULTS_LOOKUP_DATA, true)).faultContractorPropertyVisitSlots;
      this.sessionSlots = this.commonService.sortBy('index', this.sessionSlots)
    }
    this.initForm();
    if ((this.contractorDetails && this.contractorDetails.contractorPropertyVisitAt) || this.contractorWoPropertyVisitAt) {
      this.minDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() - 30), this.DATE_FORMAT.YEAR_DATE_TIME_1);
    }
    else {
      this.minDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() - 30), this.DATE_FORMAT.YEAR_DATE_TIME_1);
    }
    this.patchValue();
  }

  private initForm() {
    this.appointmentForm = this.formBuilder.group({
      dateTimeType: ['', Validators.required],
      dateTime: [''],
      appointmentSlot: ['']
    });
  }

  async save() {
    if (this.appointmentForm.valid) {
      const requestObj: any = {
        contractorPropertyVisitAt: this.commonService.getFormatedDate(this.appointmentForm.value.dateTime, this.DATE_FORMAT.YEAR_DATE_TIME),
        isAccepted: true,
        submittedByType: 'SECUR_USER',
        contractorId: this.contractorDetails ? this.contractorDetails.contractorId : ''
      }

      if (this.type === APPOINTMENT_MODAL_TYPE.QUOTE) {
        requestObj.contractorPropertyVisitSlot = this.appointmentForm.value?.appointmentSlot ? this.appointmentForm.value.appointmentSlot.index : '';
        const updateCCVisit = await this.saveContractorVisit(this.faultNotificationId, requestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      } else if (this.type === APPOINTMENT_MODAL_TYPE.WO) {
        requestObj.contractorWoPropertyVisitSlot = this.appointmentForm.value?.appointmentSlot ? this.appointmentForm.value.appointmentSlot.index : '';
        const updateCCVisit = await this.saveWoContractorVisit(this.faultNotificationId, requestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      } else if (this.type === APPOINTMENT_MODAL_TYPE.MODIFY_QUOTE) {
        const quoteRequestObj = {
          contractorPropertyVisitAt: this.commonService.getFormatedDate(this.appointmentForm.value.dateTime, this.DATE_FORMAT.YEAR_DATE_TIME),
          contractorId: this.contractorDetails.contractorId,
          contractorPropertyVisitSlot: this.appointmentForm.value?.appointmentSlot ? this.appointmentForm.value.appointmentSlot.index : ''
        };
        const updateCCVisit = await this.modifyContractorVisit(this.faultId, quoteRequestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      } else if (this.type === APPOINTMENT_MODAL_TYPE.MODIFY_WO) {
        const quoteRequestObj = {
          contractorWoPropertyVisitAt: this.commonService.getFormatedDate(this.appointmentForm.value.dateTime, this.DATE_FORMAT.YEAR_DATE_TIME),
          contractorWoPropertyVisitSlot: this.appointmentForm.value?.appointmentSlot ? this.appointmentForm.value.appointmentSlot.index : ''
        };
        const updateCCVisit = await this.modifyWoContractorVisit(this.faultId, quoteRequestObj);
        if (updateCCVisit) {
          this.modalController.dismiss('success');
        }
      }
    } else {
      this.appointmentForm.markAllAsTouched();
    }

  }

  saveContractorVisit(faultNotificationId, requestObj) {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveContractorVisit(faultNotificationId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Yes, agreed Date/Time with Tenant', 'error');
          resolve(false)
        }
      );
    });
    return promise;
  }

  saveWoContractorVisit(faultNotificationId, requestObj) {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateWOContractorVisit(faultNotificationId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false)
        }
      );
    });
    return promise;
  }

  modifyContractorVisit(faultId, requestObj) {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.modifyContractorVisit(faultId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false)
        }
      );
    });
    return promise;
  }

  modifyWoContractorVisit(faultId, requestObj) {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.modifyWoContractorVisit(faultId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false)
        }
      );
    });
    return promise;
  }

  async onCancel() {
    if (!this.appointmentForm.value.dateTime) {
      this.dismiss();
    } else {
      this.unSavedData = true;
    }
  }

  continue() {
    this.unSavedData = false;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  checkPastDate() {
    if (this.appointmentForm.value.dateTime <= this.commonService.getFormatedDate(new Date(), this.DATE_FORMAT.YEAR_DATE_TIME_1)) {
      this.pastDateError = true;
    }
    else {
      this.pastDateError = false;
    }
  }

  checkPastDateWithSession() {
    if (this.appointmentForm.value?.appointmentSlot && this.appointmentForm.value?.dateTime) {
      const appointmentSlotTime = this.appointmentForm.value.appointmentSlot.value.split(',')[1];
      const appointmentSlotEndTime = (appointmentSlotTime.split('-')[1]).split(':')
      const finalDateTime = new Date(this.appointmentForm.value.dateTime).setHours(appointmentSlotEndTime[0], appointmentSlotEndTime[1]);
      if (finalDateTime) {
        this.appointmentForm.get('dateTime').setValue(this.commonService.getFormatedDate(finalDateTime, this.DATE_FORMAT.YEAR_DATE_TIME_1));
      }
      if (new Date(this.appointmentForm.value.dateTime) <= new Date(this.commonService.getFormatedDate(new Date(), this.DATE_FORMAT.YEAR_DATE_TIME_1))) {
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
    this.appointmentForm.get('dateTime').reset();
    this.appointmentForm.get('dateTime').clearValidators();
    this.appointmentForm.get('dateTime').updateValueAndValidity();
    this.appointmentForm.get('appointmentSlot').reset();
    this.appointmentForm.get('appointmentSlot').clearValidators();
    this.appointmentForm.get('appointmentSlot').updateValueAndValidity();
    if (this.appointmentForm.get('dateTimeType').value === DATE_TIME_TYPES_KEYS.DATE_WITH_TIME) {
      this.isDateWithTime = true;
      this.appointmentForm.get('dateTime').reset();
      this.appointmentForm.get('dateTime').setValidators(Validators.required);
      this.appointmentForm.get('dateTime').updateValueAndValidity();
    }
    if (this.appointmentForm.get('dateTimeType').value === DATE_TIME_TYPES_KEYS.DATE_WITH_SESSION) {
      this.isDateWithSession = true;
      this.appointmentForm.get('dateTime').reset();
      this.appointmentForm.get('dateTime').setValidators(Validators.required);
      this.appointmentForm.get('dateTime').updateValueAndValidity();
      this.appointmentForm.get('appointmentSlot').reset();
      this.appointmentForm.get('appointmentSlot').setValidators(Validators.required);
      this.appointmentForm.get('appointmentSlot').updateValueAndValidity();
    }
  }

  private patchValue(): void {
    if (this.type === APPOINTMENT_MODAL_TYPE.MODIFY_QUOTE) {
      this.appointmentForm.patchValue({
        dateTimeType: this.contractorDetails.contractorPropertyVisitSlot ? DATE_TIME_TYPES_KEYS.DATE_WITH_SESSION : DATE_TIME_TYPES_KEYS.DATE_WITH_TIME
      });
      this.onDateTimeTypeSelection();
      this.appointmentForm.get('dateTime').patchValue(this.contractorDetails.contractorPropertyVisitAt);
      this.appointmentForm.get('appointmentSlot').patchValue(this.contractorDetails.contractorPropertyVisitSlot ? this.sessionSlots.filter(item => this.contractorDetails.contractorPropertyVisitSlot === item.index)[0] : '');
    } else if (this.type === APPOINTMENT_MODAL_TYPE.MODIFY_WO) {
      this.appointmentForm.patchValue({
        dateTimeType: this.contractorWoPropertyVisitSlot ? DATE_TIME_TYPES_KEYS.DATE_WITH_SESSION : DATE_TIME_TYPES_KEYS.DATE_WITH_TIME
      });
      this.onDateTimeTypeSelection();
      this.appointmentForm.get('dateTime').patchValue(this.contractorWoPropertyVisitAt);
      this.appointmentForm.get('appointmentSlot').patchValue(this.contractorWoPropertyVisitSlot ? this.sessionSlots.filter(item => this.contractorWoPropertyVisitSlot === item.index)[0] : '');
    }
  }
}
