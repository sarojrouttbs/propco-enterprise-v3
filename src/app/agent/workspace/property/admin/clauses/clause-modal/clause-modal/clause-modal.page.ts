import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-clause-modal',
  templateUrl: './clause-modal.page.html',
  styleUrls: ['./clause-modal.page.scss'],
})
export class ClauseModalPage implements OnInit {

  clauseForm: FormGroup
  clausesHeadingList;

  constructor(
    private formBuilder: FormBuilder,
    private agentService: AgentService,
    private modalController: ModalController,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.clauseForm = this.formBuilder.group({
      clauseCategory: [''],
      clauseHeadingId: [''],
      clauseName: [''],
      clauseNumber: [''],
      clauseScope: ['PROPERTY'],
      clauseText: [''],
      isNewHeading: [false],
      newHeading: this.formBuilder.group({
        clauseNumber: [''],
        clauseHeading: ['']
      })
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
      this.modalController.dismiss('success');
    }, (error) => {
      this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Create Key Set', 'error');
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
