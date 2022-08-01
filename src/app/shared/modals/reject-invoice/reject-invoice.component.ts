import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from 'src/app/faults/faults.service';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reject-invoice',
  templateUrl: './reject-invoice.component.html',
  styleUrls: ['./reject-invoice.component.scss'],
})
export class RejectInvoiceComponent implements OnInit {
  faultId;
  title;
  headingOne;
  headingTwo;
  rejectInvoiceForm: FormGroup;
  showLoader: boolean = null;
  unSavedData = false;

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private modalController: ModalController,
    private commonService: CommonService) { }

  ngOnInit() { this.rejectInvoiceForm = this.fb.group({ rejectionReason: ['', Validators.required] }); }

  dismiss() {
    this.modalController.dismiss();
  }

  pmRejectInvoice() {
    if (!this.rejectInvoiceForm.valid) { this.rejectInvoiceForm.markAllAsTouched(); return; }
    this.showLoader = true;
    let notificationObj = {} as any;
    notificationObj.isApproved = false;
    notificationObj.rejectionReason = this.rejectInvoiceForm.value.rejectionReason;
    return new Promise((resolve) => {
      this.faultsService.pmRejectApproveInvoice(notificationObj, this.faultId).subscribe(
        res => {
          this.commonService.showMessage('Success', 'Invoice Rejected', 'success');
          this.showLoader = false;
          this.modalController.dismiss('success');
        },
        error => {
          this.commonService.showMessage('Failed', 'Invoice Rejected', 'error');
          this.showLoader = false;
          resolve(false);
        }
      );
    });
  }

  async onCancel() {
    if (this.rejectInvoiceForm.value.rejectionReason) {
      this.unSavedData = true;
    } else {
      this.dismiss();
    }
  }

  continue() {
    this.unSavedData = false;
  }

}
