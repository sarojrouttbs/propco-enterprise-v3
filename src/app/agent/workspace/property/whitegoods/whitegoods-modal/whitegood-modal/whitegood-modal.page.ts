import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { DATE_FORMAT, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-whitegood-modal',
  templateUrl: './whitegood-modal.page.html'
})
export class WhitegoodModalPage implements OnInit {

  whitegoodForm: FormGroup;
  lookupdata: any;
  certificateTypes: any;
  DATE_FORMAT = DATE_FORMAT;
  propertyId;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private agentService: AgentService
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.initForm();
  }

  getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data: any) {
    this.certificateTypes = data.certificateTypes;
  }

  private initForm() {
    this.whitegoodForm = this.formBuilder.group({
      type: ['', Validators.required],
      managementServiceNumber: [''],
      membershipNumber: [''],
      contact: [''],
      contactNumber: [''],
      contactRef: [''],
      supplierAddress: [''],
      appliance: [''],
      starRating: [''],
      model: [''],
      age: [''],
      serialNumber: [''],
      startDate: ['', Validators.required],
      expireDate: ['', Validators.required],
      notes: ['']
    });
  }

  getExpiryDate() {
    const startDate = this.whitegoodForm.value.startDate;
    this.whitegoodForm.get('startDate').patchValue(this.commonService.getFormatedDate(startDate));
    const expiryDate = this.commonService.getFormatedDate(new Date(startDate).setFullYear(new Date().getFullYear() + 1));
    this.whitegoodForm.get('expireDate').patchValue(expiryDate);
  }

  createWhiteGoods() {
    if (this.whitegoodForm.invalid) {
      this.whitegoodForm.markAllAsTouched();
      return;
    }
    this.agentService.createWhiteGoods(this.propertyId, this.whitegoodForm.value).subscribe((res) => {
      this.modalController.dismiss('success');
    }, (error) => {
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Create Key Set', 'error');
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
