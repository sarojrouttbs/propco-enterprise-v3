import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../shared/services/common.service';
import { ValidationService } from '../shared/services/validation.service';
import { MarketAppraisalService } from './market-appraisal.service';
@Component({
  selector: 'app-market-appraisal',
  templateUrl: './market-appraisal.page.html',
  styleUrls: ['./market-appraisal.page.scss'],
})
export class MarketAppraisalPage implements OnInit {

  type = 'contact';
  maForm: FormGroup;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private formBuilder: FormBuilder,
    private maService: MarketAppraisalService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.maForm = this.formBuilder.group({
      contactForm: this.formBuilder.group({
        heardReason: ['', Validators.required],
        officeCode: ['', Validators.required],
        enquiryNotes: [''],
        landlordStatus: [''],
        mobile: ['', [Validators.required, ValidationService.numberValidator]],
        homeTelephone: ['', [Validators.required]],
        businessTelephone: ['', [Validators.required]],
        email: ['', [Validators.required, ValidationService.emailValidator]],
        title: [''],
        forename: [''],
        middleName: [''],
        surname: [''],
        address: this.formBuilder.group({
          postcode: ['', Validators.required],
          addressLine1: [''],
          addressLine2: [''],
          addressLine3: [''],
          buildingName: [''],
          buildingNumber: [''],
          country: [''],
          county: [''],
          locality: [''],
          town: [''],
          domesticId: ['']
        }),
        displayAs: ['', Validators.required],
        owners: [{ value: '', disabled: true }],
        ownership: [''],
        addressee: [''],
        salutation: ['']
      })
    });
  }

  cancel() {
    this.commonService.showConfirm('Market Appraisal', 'Are you sure, you want to cancel?', '', 'Yes', 'No').then(async res => {
      if (res) {
        this.router.navigate(['agent/dashboard'], { replaceUrl: true });
      }
    });
  }

  changeSegment() {
    if (this.type === 'contact') {
      this.type = 'property'
    } else {
      this.type = 'contact'
    }
  }

  saveWithoutBooking() {
    //Scenario 5 : New Landlord - No Property
    //here need to add condition in && for invalid property form
    //condition: this.maForm.get('contactForm').valid && this.maForm.get('propertyForm').invalid
    if (this.maForm.get('contactForm').valid) {
      this.commonService.showConfirm('Market Appraisal', 'Do you wish to continue without creating a property? If No, please fill all the mandatory fields.', '', 'Yes', 'No').then(res => {
        if (res) {
          this.createLandlord();
        }else{
          this.type = 'property'
        }
      });
    }

    // Scenario 1 : New Landlord - New Property
    // condition: this.maForm.get('contactForm').valid && this.maForm.get('propertyForm').valid

  }

  createLandlord() {
    const params = this.maForm.get('contactForm').value;
    const promise = new Promise((resolve, reject) => {
      this.maService.createLandlord(params).subscribe(
        (res) => {
          this.commonService.showAlert('Notes', 'Contact ' + this.maForm.get('contactForm').value.displayAs + ' has been created successfully', '', 'notes-alert').then(res => {
            if (res) {
              this.router.navigate(['agent/dashboard'], { replaceUrl: true });
            }
          });
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }
}
