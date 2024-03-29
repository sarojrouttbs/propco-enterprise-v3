import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { HmrcService } from '../hmrc.service';
import { DATE_FORMAT, DEFAULT_MESSAGES, ERROR_CODE, HMRC_CONFIG, HMRC_ERROR_MESSAGES, SYSTEM_CONFIG } from 'src/app/shared/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { BatchDetail } from '../hmrc-modal';

@Component({
  selector: 'app-self-assessment-form',
  templateUrl: './self-assessment-form.component.html',
  styleUrls: ['./self-assessment-form.component.scss'],
})
export class SelfAssessmentFormComponent implements OnInit {

  @ViewChild('stepper', { static: false }) stepper: MatStepper;
  currentStepperIndex = 0;
  selfAssessmentForm: FormGroup;
  nextLabel: string = 'Next 1/3';
  landlordParams: any = new HttpParams();
  DATE_FORMAT = DATE_FORMAT;
  isHmrcLandlordSelected = 'false';
  systemConfig: any;
  isHmrcLandlordSelectPreview: any;

  constructor(
    private fb: FormBuilder,
    private hmrcService: HmrcService,
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getSystemConfig();
    this.checkExistingBatch();
  }

  initForm() {
    this.selfAssessmentForm = this.fb.group({
      propertyOffice: [''],
      propertyOfficeCodes: [''],
      selectedPropertyOfficeCodes: [''],
      managementType: [''],
      selectedManagementType: [''],
      from: [null, Validators.required],
      to: [null, Validators.required],
      quickFilterType: null,
      searchOnColumns: null,
      searchText: null,
      selectedPropertyLinkIds: null,
      deselectedPropertyLinkIds: null,
      statementPreference: null,
      taxHandler: null,
      batchId: ''
    });
  }

  private getSystemConfig() {
    const params = new HttpParams().set('key', SYSTEM_CONFIG.HMRC_TAX_HANDLER_SELF_ASSESSMENT_FORM)
    return new Promise((resolve) => {
      this.hmrcService.getSysconfig(params).subscribe((res) => {
        this.systemConfig = res ? res.HMRC_TAX_HANDLER_SELF_ASSESSMENT_FORM : '';
        this.selfAssessmentForm.get('taxHandler').patchValue(this.systemConfig);
        resolve(true);
      });
    });
  }

  onNext(stepIndex: any) {
    switch (stepIndex) {
      case 0:
        this.stepper.selectedIndex = 1;
        this.nextLabel = 'Next 2/3'
        break;
      case 1:
        this.stepper.selectedIndex = 2;
        break;
      default:
        break;
    }
  }

  onBack(stepIndex: any) {
    switch (stepIndex) {
      case 1:
        this.stepper.selectedIndex = 0;
        this.nextLabel = 'Next 1/3'
        break;
      case 2:
        this.stepper.selectedIndex = 1;
        this.nextLabel = 'Next 2/3'
        break;
      default:
        break;
    }
  }

  onHmrcLandlordSelect(data: any) {
    this.isHmrcLandlordSelected = data;
  }

  onHmrcLandlordSelectPreview(data: any) {
    this.isHmrcLandlordSelectPreview = data;
  }

  async proceed() {
    const proceed = await this.commonService.showConfirm('HMRC Self-Assessment Form', 'Are you sure you want to proceed with the send action?', '', 'Confirm', 'Cancel');
    if (proceed) {
      this.generateHMRC()
    }
  }

  async generateHMRC() {
    const params = {
      accountType: HMRC_CONFIG.HMRC_SENDER_EMAIL_ACCOUNT,
      financialYearDateRange: {
        from: this.selfAssessmentForm.value.from,
        to: this.selfAssessmentForm.value.to
      },
      deselectedPropertyLinkIds: this.selfAssessmentForm.value.deselectedPropertyLinkIds ? this.selfAssessmentForm.value.deselectedPropertyLinkIds : [],
      managementType: this.selfAssessmentForm.value.selectedManagementType ? this.selfAssessmentForm.value.selectedManagementType : [],
      propertyOffice: this.selfAssessmentForm.value.selectedPropertyOfficeCodes ? this.selfAssessmentForm.value.selectedPropertyOfficeCodes : [],
      searchOnColumns: this.selfAssessmentForm.value.searchOnColumns,
      searchText: this.selfAssessmentForm.value.valuesearchText,
      selectedPropertyLinkIds: this.selfAssessmentForm.value.selectedPropertyLinkIds ? this.selfAssessmentForm.value.selectedPropertyLinkIds : [],
      taxHandler: this.selfAssessmentForm.value.taxHandler
    }

    this.hmrcService.generateHMRC(params).subscribe((res) => {
      if (res) {
        const response = res;
        this.selfAssessmentForm.get('batchId').patchValue(response.batchId);
      }
      this.commonService.setItem('HMRC_FILTER', this.selfAssessmentForm.value);
      this.router.navigate(['../progress-summary'], { replaceUrl: true, relativeTo: this.route });
    }, (error) => {
      if (error?.error?.errorCode === ERROR_CODE.UNPROCESSABLE_ENTITY) {
        this.commonService.showMessage(HMRC_ERROR_MESSAGES.ANOTHER_PROCESS_IS_RUNNING, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
        return;
      }
      this.commonService.showMessage(HMRC_ERROR_MESSAGES.FACING_PROBLEM_TO_GENERATE_REPORT, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
    });
  }

  private async checkExistingBatch() {
    const existingBatch: any = await this.getUserBatch();
    if (existingBatch) {
      const existingBatchDetails = await this.getBatchDetails(existingBatch.batchId) as BatchDetail;
      if (existingBatchDetails) {
        if (this.commonService.getItem('HMRC_FILTER')) {
          /* Redirect to progress summary page if processing is not completed */
          this.selfAssessmentForm.value.batchId = existingBatch.batchId;
          // this.commonService.setItem('HMRC_FILTER', this.selfAssessmentForm.value)
          this.router.navigate(['../progress-summary'], { replaceUrl: true, relativeTo: this.route });
        }
      }
    }
  }


  private getBatchDetails(batchId: string) {
    return new Promise((resolve) => {
      this.hmrcService.getHmrcBatchDetails(batchId).subscribe(
        (res) => {
          resolve(res ? res : null);
        },
        (_error) => {
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.GET_DETAILS_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
          resolve(null);
        }
      );
    });
  }

  private getUserBatch() {
    return new Promise((resolve) => {
      this.hmrcService.getUserBatch().subscribe((res) => {
        if (res) {
          resolve(res);
        } else {
          resolve(null);
        }
      },
        (_error) => {
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.GET_DETAILS_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
          resolve(null);
        });
    });
  }
}
