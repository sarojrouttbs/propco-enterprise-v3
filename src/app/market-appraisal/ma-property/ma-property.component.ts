import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { off } from 'process';
import { PROPCO } from 'src/app/shared/constants';
import { AddressModalPage } from 'src/app/shared/modals/address-modal/address-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { MarketAppraisalService } from '../market-appraisal.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-ma-property',
  templateUrl: './ma-property.component.html',
  styleUrls: ['./ma-property.component.scss'],
})
export class MaPropertyComponent implements OnInit {
  @Input() group;
  @Input() contactGroup;
  @Input('group') set _(value: any) {
    this.propertyForm = value as FormGroup;
  }
  propertyForm: FormGroup;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  address: any;
  lookupdata: any;
  propertyStyles: any;
  houseTypes: any;
  propertyAges: any;
  parkingTypes: any;
  propertyMarketingStatusLookup: any;
  propertyStatuses: any;
  letDurations: any;
  furnishingTypes: any;
  propertyLetReasons: any;
  advertisementRentFrequencies: any;
  accessibleOffices: any;
  marketLocations: any;
  propertyData;
  propertyDetails;
  duration = {
    totalYears: '00',
    totalMonths: '00',
    totalDays: '00'
  }
  constructor(private modalController: ModalController,
    private commonService: CommonService,
    private maService: MarketAppraisalService) {
  }

  ngOnInit() {
    this.getLookupData();
    this.initApiCalls();
    this.getPropertyData();
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

  getPropertyData(){
    this.maService.propertyChange$.subscribe(res =>{
      console.log('res received',res);
      this.propertyData = res;
      this.setPropertyData(this.propertyData)
    })
  }

  setPropertyData(data){
    this.address = data.propertyAddress
    this.propertyForm.patchValue({

    })
  }

  private async initApiCalls() {
    const offices = await this.getAccessibleOffices();
    const propertyDetails = await this.getPropertyDetails('438d2a62-aca0-11ea-8ddb-02420aff051f');
    console.log('propertyDetails',propertyDetails)
    if (offices) {
      this.accessibleOffices = offices;
    }
  }

  getPropertyDetails(propertyId) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.maService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

 

  private setLookupData(data) {
    this.propertyStyles = data.propertyStyles;
    this.houseTypes = data.houseTypes;
    this.propertyAges = data.propertyAges;
    this.parkingTypes = data.parkingTypes;
    this.propertyMarketingStatusLookup = data.propertyMarketingStatusLookup;
    this.propertyStatuses = data.propertyStatuses;
    this.letDurations = data.letDurations
    this.furnishingTypes = data.furnishingTypes
    this.propertyLetReasons = data.propertyLetReasons
    this.advertisementRentFrequencies = data.advertisementRentFrequencies
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  async openAddressModal() {
    const modal = await this.modalController.create({
      component: AddressModalPage,
      cssClass: 'modal-container',
      componentProps: {
        paramAddress: this.address,
        type: 'market-appraisal'
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data?.address.addressLine1) {
        this.address = res.data.address;
        this.propertyForm.get('address').patchValue(res.data.address);
      }
    });
    await modal.present();
  }

  /** Functional methods **/
  async onOfficeChange(value: string) {
    if (!value) {
      return;
    }
    this.marketLocations = [];
    this.propertyForm.controls['propertyLocations'].setValue([])
    const locations = await this.getLocationByOffice(value);
    if (locations) {
      this.marketLocations = locations;
    }
  }

  setContactAddress() {
    if (this.contactGroup.get('address').value.addressLine1) {
      this.address = this.contactGroup.get('address').value;
      this.propertyForm.get('address').patchValue(this.contactGroup.get('address').value);
    }
  }

  /* To calculate total duration on date change */
  calculateTotalDuration() {
    const propertyDetails = this.propertyForm.value;
    if (propertyDetails.availableFromDate && propertyDetails.availableToDate) {
      propertyDetails.availableToDate = new Date(propertyDetails.availableToDate)
      propertyDetails.availableFromDate = new Date(propertyDetails.availableFromDate)
      var monthDuration, dateDuration;
      var availableToYear = propertyDetails.availableToDate.getFullYear();
      var availableToMonth = propertyDetails.availableToDate.getMonth();
      var availableToDate = propertyDetails.availableToDate.getDate();

      var availableFromYear = propertyDetails.availableFromDate.getFullYear();
      var availableFromMonth = propertyDetails.availableFromDate.getMonth();
      var availableFromDate = propertyDetails.availableFromDate.getDate();

      var yearDuration = availableToYear - availableFromYear;

      if (availableToMonth >= availableFromMonth) {
        monthDuration = availableToMonth - availableFromMonth;
      } else {
        yearDuration--;
        monthDuration = 12 + availableToMonth - availableFromMonth;
      }
      if (availableToDate >= availableFromDate) {
        dateDuration = availableToDate - availableFromDate;
      } else {
        monthDuration--;
        dateDuration = 31 + availableToDate - availableFromDate;

        if (monthDuration < 0) {
          monthDuration = 11;
          yearDuration--;
        }
      }
      this.duration.totalYears = this.formatDateDuration('' + yearDuration);
      this.duration.totalMonths = this.formatDateDuration('' + monthDuration);
      this.duration.totalDays = this.formatDateDuration('' + dateDuration);
    }
  };

  private formatDateDuration(durationType) {
    var duration = durationType;
    if (duration.length <= 1) {
      duration = '0' + duration;
    }
    return duration;
  }

  /** ends**/

  /** Services**/
  private getAccessibleOffices() {
    const promise = new Promise((resolve, reject) => {
      this.maService.getaccessibleOffices().subscribe(
        (res) => {
          resolve(res ? res.data : []);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  private getLocationByOffice(officeCode: string) {
    const promise = new Promise((resolve, reject) => {
      this.maService.getOfficeLocations(officeCode).subscribe(
        (res) => {
          resolve(res ? res.data : []);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }
  /**ends**/

}
