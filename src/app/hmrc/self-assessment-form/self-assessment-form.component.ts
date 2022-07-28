import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { HmrcService } from '../hmrc.service';
import { DATE_FORMAT, SYSTEM_CONFIG } from 'src/app/shared/constants';

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
    private hmrcService: HmrcService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getSystemConfig();
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
      taxHandler: null
    });
  }

  private getSystemConfig() {
    const params = new HttpParams().set('key', SYSTEM_CONFIG.HMRC_TAX_HANDLER_SELF_ASSESSMENT_FORM)
    new Promise((resolve, reject) => {
      this.hmrcService.getSysconfig(params).subscribe((res) => {
        this.systemConfig = res ? res.HMRC_TAX_HANDLER_SELF_ASSESSMENT_FORM : '';
        this.selfAssessmentForm.get('taxHandler').patchValue(this.systemConfig);
        return resolve(true);
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
}
