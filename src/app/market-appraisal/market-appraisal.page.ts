import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../shared/services/common.service';
import { MarketAppraisalService } from './market-appraisal.service';
@Component({
  selector: 'app-market-appraisal',
  templateUrl: './market-appraisal.page.html',
  styleUrls: ['./market-appraisal.page.scss'],
})
export class MarketAppraisalPage implements OnInit {

  type = 'maContact';
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
        mobile: [''],
        homeTelephone: [''],
        businessTelephone: [''],
        email: [''],
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
          pafReference: [''],
          town: ['']
        }),
        displayAs: ['', Validators.required]
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

  saveWithoutBooking() {
    //Scenario 5 : New Landlord - No Property
    //here need to add condition in && for invalid property form
    //condition: this.maForm.get('contactForm').valid && this.maForm.get('propertyForm').invalid
    if (this.maForm.get('contactForm').valid) {
      this.commonService.showConfirm('Market Appraisal', 'Do you wish to continue without creating a property? If No, please fill all the mandatory fields.', '', 'Yes', 'No').then(res => {
        if (res) {
          this.createLandlord();
        }
      });
    }

    // Scenario 1 : New Landlord - New Property
    // condition: this.maForm.get('contactForm').valid && this.maForm.get('propertyForm').valid
    // Conformation msg will be: The Contact and/or the Property and their association has been created/modified successfully.

  }

  createLandlord() {
    const params = this.maForm.get('contactForm').value;
    const promise = new Promise((resolve, reject) => {
      this.maService.createLandlord(params).subscribe(
        (res) => {
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }
}
