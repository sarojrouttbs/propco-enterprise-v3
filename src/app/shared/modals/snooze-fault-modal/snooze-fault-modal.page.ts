import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { DATE_FORMAT } from '../../constants';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-snooze-fault-modal',
  templateUrl: './snooze-fault-modal.page.html',
  styleUrls: ['./snooze-fault-modal.page.scss'],
})
export class SnoozeFaultModalPage implements OnInit {
  snoozeFaultForm: FormGroup;
  faultId;
  minDate;
  futureDate;
  showLoader: boolean = false;
  DATE_FORMAT = DATE_FORMAT;
  
  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private modalController: ModalController,
    private faultsService: FaultsService) { }

  ngOnInit() {
    const currentDate = new Date();
    this.minDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() + 1), this.DATE_FORMAT.YEAR_DATE);
    this.futureDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() + 29), this.DATE_FORMAT.YEAR_DATE);
    this.initForm();
  }

  initForm() {
    this.snoozeFaultForm = this.formBuilder.group({
      snoozeUntil: ['', Validators.required],
      snoozeReason: ['', Validators.required],
    });
  }

  async submit() {
    const data = await this.saveSnoozeFaultData();
    if (data) {
      this.modalController.dismiss('success')
    }
  }

  async saveSnoozeFaultData() {
    const requestObj = {
      snoozeUntil: this.commonService.getFormatedDate(this.snoozeFaultForm.value.snoozeUntil),
      snoozeReason: this.snoozeFaultForm.value.snoozeReason,
      submittedById: '',
      submittedByType: 'SECUR_USER',
    }
    this.showLoader = true;
    return new Promise((resolve) => {
      this.faultsService.saveSnoozeFaultData(requestObj, this.faultId).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false);
        }
      );
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
