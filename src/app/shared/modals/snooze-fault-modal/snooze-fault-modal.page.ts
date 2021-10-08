import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
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

  constructor(private formBuilder: FormBuilder,
    private commonService: CommonService,
    private modalController: ModalController,
    private faultsService: FaultsService) { }

  ngOnInit() {
    const currentDate = new Date();
    this.minDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() + 1), 'yyyy-MM-dd');
    this.futureDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() + 29), 'yyyy-MM-dd');
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
    const promise = new Promise((resolve, reject) => {
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
    return promise;
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
