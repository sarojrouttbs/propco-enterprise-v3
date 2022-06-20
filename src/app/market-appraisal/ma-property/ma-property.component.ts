import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { off } from 'process';
import { PROPCO } from 'src/app/shared/constants';
import { AddressModalPage } from 'src/app/shared/modals/address-modal/address-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { MarketAppraisalService } from '../market-appraisal.service';
import { HttpParams } from '@angular/common/http';
import { error } from 'protractor';


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
  existingPropertyId: string = null;
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

  private async initApiCalls() {
    const offices = await this.getAccessibleOffices();
    if (offices) {
      this.accessibleOffices = offices;
    }
  }

  getPropertyData() {
    this.maService.propertyChange$.subscribe(res => {
      if (res === 'reset') {
        this.address = '';
        this.propertyForm.reset();
      } else {
        this.propertyData = res;
        const id = this.propertyData.propertyId ? this.propertyData.propertyId : this.propertyData.entityId;
        this.existingPropertyId = id;
        this.setPropertyData(id);
      }
    })
  }

  async setPropertyData(id) {
    const property: any = await this.getPropertyDetails(id);
    this.address = property.address
    this.propertyForm.patchValue({
      office: property.office ? property.office : '',
      propertyId: property.propertyId,
      numberOfBedroom: property.numberOfBedroom ? property.numberOfBedroom : '',
      houseType: property.houseType ? property.houseType : '',
      isStudio: property.isStudio,
      propertyStyle: property.propertyStyle ? property.propertyStyle : '',
      propertyAge: property.propertyAge ? property.propertyAge : '',
      lettingReason: property.lettingReason ? property.lettingReason : '',
      lettingDuration: property.lettingDuration ? property.lettingDuration : '',
      onWithOtherAgent: property.onWithOtherAgent,
      propertyNotes: property.propertyDescription ? property.propertyDescription : '',
      direction: property.direction ? property.direction : '',
      parking: property.parking ? Number(property.parking) : '',
      advertisementRentFrequency: property.advertisementRentFrequency ? property.advertisementRentFrequency : '',
      furnishingType: property.furnishingType ? (property.furnishingType === '0' ? null : parseInt(property.furnishingType)) : '',
      hasLetBefore: property.hasLetBefore,
      status: property.status ? property.status.toString() : '',
      agentName: property.agentName ? property.agentName : '',
      rentRange: {
        minimum: property.minimumRent ? property.minimumRent : '',
        maximum: property.maximumRent ? property.maximumRent : '',
      },
      availableFromDate: property.availableFromDate ? property.availableFromDate : '',
      availableToDate: property.availableToDate ? property.availableToDate : '',
      address: {
        postcode: property.address ? property.address.postcode : null,
        addressLine1: property.address ? property.address.addressLine1 : null,
        addressLine2: property.address ? property.address.addressLine2 : null,
        addressLine3: property.address ? property.address.addressLine3 : null,
        buildingName: property.address ? property.address.buildingName : null,
        buildingNumber: property.address ? property.address.buildingNumber : null,
        country: property.address ? property.address.country : null,
        county: property.address ? property.address.county : null,
        locality: property.address ? property.address.locality : null,
        town: property.address ? property.address.town : null,
        pafReference: property.address ? property.address.pafReference : null
      },
    });
    this.calculateTotalDuration();
  }

  private setLookupData(data) {
    this.propertyStyles = data.propertyStyles;
    this.houseTypes = data.houseTypes;
    this.propertyAges = data.propertyAges;
    this.parkingTypes = data.parkingTypes;
    this.propertyMarketingStatusLookup = data.propertyMarketingStatusLookup;
    this.propertyStatuses = data.propertyStatuses;
    this.furnishingTypes = data.furnishingTypes
    this.propertyLetReasons = data.propertyLetReasons
    this.advertisementRentFrequencies = data.advertisementRentFrequencies
    this.letDurations = data.propertyLetDurations;
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  async openAddressModal() {
    const modal = await this.modalController.create({
      component: AddressModalPage,
      cssClass: 'modal-container ma-modal-container',
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
    this.propertyForm.controls.propertyLocations.setValue([]);
    const locations = await this.getLocationByOffice(value);
    if (locations) {
      this.marketLocations = locations;
    }
    if (this.existingPropertyId) {
      const propertyLocaltions = await this.getPropertyLocationsByPropertyId(this.existingPropertyId);
      this.propertyForm.controls.propertyLocations.setValue(propertyLocaltions);
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

  private getPropertyDetails(propertyId: string) {
    const promise = new Promise((resolve, reject) => {
      this.maService.getPropertyDetails(propertyId).subscribe(
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




  private getPropertyLocationsByPropertyId(propertyId: string) {
    const promise = new Promise((resolve, reject) => {
      this.maService.getPropertyLocationsByPropertyId(propertyId).subscribe(
        res => {
          const propertylocationIds: any = [];
          if (res && res.data) {
            res.data.forEach(element => {
              propertylocationIds.push(element.locationId)
            });
            resolve(propertylocationIds);
          }
        }, error => {
          resolve([]);
        }
      );
    });
    return promise;
  }
  /**ends**/

}
