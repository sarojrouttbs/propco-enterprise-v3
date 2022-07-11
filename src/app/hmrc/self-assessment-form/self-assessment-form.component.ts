import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-self-assessment-form',
  templateUrl: './self-assessment-form.component.html',
  styleUrls: ['./self-assessment-form.component.scss'],
})
export class SelfAssessmentFormComponent implements OnInit {

  @ViewChild("stepper", { static: false }) stepper: MatStepper;
  currentStepperIndex = 0;
  selfAssessmentForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm()
  }

  initForm() {
    this.selfAssessmentForm = this.fb.group({
      managementType: ['']
    });
  }

}
