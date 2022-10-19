import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-clause-modal',
  templateUrl: './clause-modal.page.html',
  styleUrls: ['./clause-modal.page.scss'],
})
export class ClauseModalPage implements OnInit {

  clauseForm: FormGroup
  clausesHeadingList;
  lookupdata: any;
  clauseCategory: any;

  constructor(
    private formBuilder: FormBuilder,
    private agentService: AgentService,
    private modalController: ModalController,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.initForm();
  }

  private getLookupData() {
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
    this.clauseCategory = data.clauseCategory;
  }

  initForm() {
    this.clauseForm = this.formBuilder.group({
      clauseCategory: this.clauseCategory[0].index,
      clauseHeadingId: [''],
      clauseName: [''],
      clauseNumber: [''],
      clauseScope: ['Property'],
      clauseText: [''],
      isNewHeading: [false],
      newHeading: this.formBuilder.group({
        clauseNumber: [''],
        clauseHeading: ['']
      }),
      isNegotiable: false,
      isRedundant: false
    });
    this.clauseForm.get('newHeading').disable();
  }

  onToggle(e: any) {
    const value = e.detail.checked;
    if (value) {
      this.clauseForm.get('newHeading').enable();
      this.clauseForm.get('clauseNumber').disable()
      this.clauseForm.get('clauseHeadingId').disable()
    } else {
      this.clauseForm.get('newHeading').disable();
      this.clauseForm.get('clauseNumber').enable()
      this.clauseForm.get('clauseHeadingId').enable()
    }
  }

  createClause() {
    if (this.clauseForm.invalid) {
      this.clauseForm.markAllAsTouched();
      return;
    }
    this.agentService.createClause(this.clauseForm.value).subscribe((res) => {
      this.modalController.dismiss({
        status: 'success',
        data: res ? res : ''
      });
    }, (error) => {
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Add Clause', 'error');
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
