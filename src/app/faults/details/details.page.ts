import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FaultsService } from '../faults.service';
import { catList, propertyData } from './cat.json';

@Component({
  selector: 'fault-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  catList: any[] = catList;
  propertyData = propertyData;
  pageNo = 1;
  faultDetails: any = {};
  propertyId = '5eae3eee-f99b-11e8-bd34-0cc47a54d954';
  propertyDetails;
  propertyTenancyDetails;
  propertyHMODetails;
  addtionalInfo;
  describeFaultForm: FormGroup;
  faultDetailsForm: FormGroup;
  addAdditionalDetForm: FormGroup;
  reportedByFOrm: FormGroup;
  accessInfoForm: FormGroup;

  categoryIconList = [
    'assets/images/fault-categories/alarms-and-smoke-detectors.svg',
    'assets/images/fault-categories/bathroom.svg',
    'assets/images/fault-categories/electricity.svg',
    'assets/images/fault-categories/fire.svg',
    'assets/images/fault-categories/floors-walls-and-ceilings .svg',
    'assets/images/fault-categories/garden.svg',
    'assets/images/fault-categories/hot-water.svg',
    'assets/images/fault-categories/kitchen.svg',
    'assets/images/fault-categories/lighting.svg',
    'assets/images/fault-categories/others.svg',
    'assets/images/fault-categories/smell-oil-or-gas.svg',
    'assets/images/fault-categories/toilet.svg',
    'assets/images/fault-categories/water-and-leaks.svg'
  ];

  constructor(private faultService: FaultsService, private fb: FormBuilder) {
  }

  ionViewDidEnter() {
    this.initiateFault();
  }

  ngOnInit() {
    this.catList.map((cat, index) => {
      cat.imgPath = this.categoryIconList[index];
    });
  }

  goToPriorityPage(pageNo) {
    this.pageNo = pageNo;
  }

  initiateFault() {
    this.initiateForms();
    this.initialApiCall();
  }

  initiateForms() {
    this.initDescribeFaultForm();
    this.initFaultDetailsForm();
    this.initaddAdditionalDetForm();
    this.initReportedByForm();
    this.initAccessInfiForm();
  }

  initDescribeFaultForm(): void {
    this.describeFaultForm = this.fb.group({
      title: ['', Validators.required],
      urgencyStatus: ['', Validators.required]
    });
  }

  initFaultDetailsForm(): void {
    this.faultDetailsForm = this.fb.group({
      notes: ['', Validators.required],
      additionalInfo: this.fb.array([])
    });
  }

  initaddAdditionalDetForm(): void {
    this.describeFaultForm = this.fb.group({
      label: ['', Validators.required],
      value: ['', Validators.required]
    });
  }

  initAccessInfiForm(): void {
    this.describeFaultForm = this.fb.group({
      tenantNotes: '',
      areOccupiersVulnerable: '',
      isTenantPresenceRequired: ['', Validators.required]
    });
  }

  initReportedByForm(): void {
    this.describeFaultForm = this.fb.group({
      reportedBy: ['', Validators.required],
      agreementId: ['', Validators.required],
      reportedById: '',
      propertyId: '',
      isDraft: false,
      tenantId: ['', Validators.required],
      title: [{ value: '', disabled: true }],
      forename: [{ value: '', disabled: true }],
      surname: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      mobile: [{ value: '', disabled: true }],
      homeTelephoneNo: [{ value: '', disabled: true }]
    });
  }

  initialApiCall() {
    forkJoin([
      this.getFaultAdditionalInfo(),
      this.getPropertyById(),
      this.getPpropertyTenancies(),
      this.getHMOLicenceDetails()
    ]);
  }

  getPropertyById(): void {
    this.faultService.getPropertyById(this.propertyId).subscribe(
      res => {
        if (res && res.data) {
          this.propertyDetails = res.data;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getPpropertyTenancies(): void {
    this.faultService.getPropertyTenancies(this.propertyId).subscribe(
      res => {
        if (res && res.data) {
          this.propertyTenancyDetails = res.data;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getHMOLicenceDetails(): void {
    this.faultService.getHMOLicenceDetailsAgainstProperty(this.propertyId).subscribe(
      res => {
        if (res && res.data) {
          this.propertyHMODetails = res.data;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getFaultAdditionalInfo(): void {
    this.faultService.getFaultAdditionalInfo().subscribe(
      res => {
        if (res) {
          this.addtionalInfo = res.data;
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  getAgreementDetails(agreementId): void {
    this.faultService.getPropertyAgreementDetails(this.propertyId, agreementId).subscribe(
      res => {
        if (res && res.data) {
        }
      },
      error => {
        console.log(error);
      }
    );
  }


}
