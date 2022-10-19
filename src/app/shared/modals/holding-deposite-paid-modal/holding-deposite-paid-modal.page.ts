import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DATE_FORMAT } from '../../constants';
import { CommonService } from '../../services/common.service';
import { HodlingDepositePaidService } from './hodling-deposite-paid.service';

@Component({
  selector: 'app-holding-deposite-paid-modal',
  templateUrl: './holding-deposite-paid-modal.page.html',
  styleUrls: ['./holding-deposite-paid-modal.page.scss'],
})
export class HoldingDepositePaidModalPage implements OnInit {
  heading;
  propertyId;
  selectedApplication;
  offlinePaymentTypes;
  holdingDepositForm: FormGroup;
  DATE_FORMAT = DATE_FORMAT;

  constructor(private modalController: ModalController, private _formBuilder: FormBuilder, private commonService: CommonService, private holdingDepositePaidService: HodlingDepositePaidService) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.holdingDepositForm = this._formBuilder.group({
      offlinePaymentMethod: ['', Validators.required],
      offlinePaymentReference: ['', Validators.required],
      offlinePaymentDate: ['', Validators.required]
    });
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  submit() {
    if (this.holdingDepositForm.invalid) {
      this.holdingDepositForm.markAllAsTouched();
    } else {
      var requestObj = this.holdingDepositForm.value
      requestObj.propertyId = this.propertyId;
      requestObj.offlinePaymentDate = this.commonService.getFormatedDate(requestObj.offlinePaymentDate);
      requestObj.isHoldingDepositPaid = true;
      requestObj.startDate = this.selectedApplication.moveInDate;
      requestObj.expiryDate = this.selectedApplication.preferredTenancyEndDate;
      this.offlinePaymentService(requestObj)
    }
  }

  private offlinePaymentService(requestObj) {
    this.holdingDepositePaidService.offlinePaymentService(this.selectedApplication.applicationId, requestObj).subscribe(res => {
      this.modalController.dismiss({ holdingDepositePaid: true });
    });
  }
}