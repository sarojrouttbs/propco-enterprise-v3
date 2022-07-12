import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { HmrcService } from '../hmrc.service';
import { DatePipe } from '@angular/common';
import { DATE_FORMAT } from 'src/app/shared/constants';

@Component({
  selector: 'app-self-assessment-form',
  templateUrl: './self-assessment-form.component.html',
  styleUrls: ['./self-assessment-form.component.scss'],
})
export class SelfAssessmentFormComponent implements OnInit {

  @ViewChild("stepper", { static: false }) stepper: MatStepper;
  currentStepperIndex = 0;
  selfAssessmentForm: FormGroup;
  nextLabel: string = 'Next 1/3';
  landlordParams: any = new HttpParams();
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private fb: FormBuilder,
    private hmrcService: HmrcService,
    public datepipe: DatePipe,
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.selfAssessmentForm = this.fb.group({
      managementType: [''],
      from: [null, Validators.required],
      to: [null, Validators.required],
      quickFilterType: null,
      searchOnColumns: null,
      searchText: null
    });
  }

  onNext(stepIndex: any) {
    switch (stepIndex) {
      case 0:
        this.stepper.selectedIndex = 1;
        this.nextLabel = 'Next 2/3'
        break;
      case 1:
        this.getLandlords();
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


  private getLandlords() {
    if (!this.selfAssessmentForm.get('from').value && !this.selfAssessmentForm.get('to').value) {
      return;
    }
    this.landlordParams = this.landlordParams
      .set('lastGeneratedDateRange.from', this.selfAssessmentForm.get('from').value ? this.datepipe.transform(this.selfAssessmentForm.get('from').value, this.DATE_FORMAT.YEAR_DATE) : '')
      .set('lastGeneratedDateRange.to', this.selfAssessmentForm.get('to').value ? this.datepipe.transform(this.selfAssessmentForm.get('to').value, this.DATE_FORMAT.YEAR_DATE) : '')
      .set('hideLoader', 'true');
    const promise = new Promise((resolve, reject) => {
      this.hmrcService.getLandlords(this.landlordParams).subscribe((res) => {
        return resolve(res);
      });
    });
    return promise;
  }

}
