import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-arranging-contractors',
  templateUrl: './arranging-contractors.component.html',
  styleUrls: ['./arranging-contractors.component.scss'],
})
export class ArrangingContractorsComponent implements OnInit {
  raiseQuoteForm: FormGroup;
  addContractorForm: FormGroup;
  contractorListForm: FormGroup;
  @Input() quoteId;
  @Input() faultDetails: FaultModels.IFaultResponse;
  faultMaintenanceDetails;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initiateArrangingContractors();
  }

  private initiateArrangingContractors(): void {
    this.initForms();
    this.initApiCalls();
  }
  private initForms(): void {
    this.initQuoteForm();
    this.initAddContractorForm();
    this.initContractorListForm();
  }

  private initQuoteForm(): void {
    this.raiseQuoteForm = this.fb.group({
      quotationNum: ['', Validators.required],
      category: [{ value: '', disabled: true }, Validators.required],
      status: ['', Validators.required],
      descption: ['', Validators.required],
      orderedBy: [{ value: '', disabled: true }, Validators.required],
      requiredBy: '',
      contactOnSite: '',
      accessDetails: [{ value: '', disabled: true }],
      nominalCode: ['', Validators.required],
      contractor: '',
      skillSet: ''
    });
  }

  private initAddContractorForm(): void {
    this.addContractorForm = this.fb.group({
    });
  }

  private initContractorListForm(): void {
    this.addContractorForm = this.fb.group({
    });
  }


  private async initApiCalls() {
    this.faultMaintenanceDetails = await this.getFaultMaintenance();
    this.initPatching();
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => { });
    return promise;
  }

  initPatching(): void {
  }

}
