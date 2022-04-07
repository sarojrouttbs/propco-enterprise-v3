import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController, ViewDidEnter } from '@ionic/angular';
import { ImagePage } from 'src/app/shared/modals/image/image.page';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, ViewDidEnter {
  // @ViewChild(IonSlides, { static: false }) slider: IonSlides;

  propertyData: any = {
    "data":
    {
      "createdAt": "2021-10-21T14:15:10",
      "modifiedAt": "2022-02-21T14:11:04",
      "createdById": 105,
      "propertyInfo": {
        "reference": "000002091",
        "officeCode": "NTY",
        "managementType": 1,
        "fileNumber": "",
        "isPropertyOfWeek": null,
        "isReferral": null,
        "isBoardAllowed": null,
        "boardOrderedOn": null,
        "slipOrderedOn": null,
        "boardRemovedOn": null,
        "boardRef": "",
        "currentTOB": null,
        "webVisitCount": null,
        "bookingOfficeCode": "NTY",
        "acquisitionOffice": null,
        "status": 3,
        "statusChangedOn": "2021-10-21",
        "marketingAs": 3485,
        "maStatus": null,
        "maStatusChangedOn": null,
        "landlordOccupancy": 3,
        "rentCategory": null,
        "withdrawnReason": 3484,
        "isOnWithOtherAgent": null,
        "agentName": null,
        "block": null,
        "room": null,
        "isHmoProperty": false,
        "availableFrom": null,
        "availableTo": null,
        "portfolioSource": 3322,
        "address": {
          "addressLine1": "Flat 4",
          "addressLine2": "Clifton Lodge",
          "addressLine3": "18 Russell Terrace",
          "county": "Warwickshire",
          "country": "United Kingdom",
          "street": "Russell Terrace",
          "buildingName": "Clifton Lodge", "buildingNumber": "18", "postcode": "CV31 1EZ", "latitude": "52.285341025517766", "longitude": "-1.5285517760346796", "locality": null, "town": "Leamington Spa", "pafReference": "5969271.00"
        }
      }, "propertyDetails": { "numberOfReception": 1, "numberOfBathroom": 1, "ensuite": 1, "noOfKitchens": 1, "maxOccupantsAllowed": 1, "maxHouseholdsAllowed": 1, "garage": 286, "numberOfBedroom": 4, "isStudio": false, "advertisementRent": 0, "isRentNegotiable": false, "advertisementRentFrequency": 0, "houseType": 116, "propertyAge": 232, "numberOfFloors": null, "floorArea": 0, "floorAreaType": null, "parking": "581", "garden": 3135, "heatingType": null, "pets": null, "furnishingType": null, "holdingDeposit": 400, "isExclCouncilTax": true, "isExclWaterTax": true, "isStudentLettingEnabled": false, "isStudentFriendly": false, "isAnyFacilityShared": false, "legacyReference": null, "floor": null, "showerRooms": 0, "memberNo": null, "lettingReason": null, "propertyStyle": null, "kitchenStyle": null, "propertyCategory": null, "overAllCondition": null, "decorativeCondition": null, "isLiftAccess": null, "appraisedDate": null, "instructedDate": null, "phoneOne": null, "phoneTwo": null, "hasLetBefore": false, "hasGas": false, "hasPat": false, "hasPortableAppliances": false, "hasElectricalIndemnitySigned": false, "hasOil": false, "hasSolidFuel": false }, "propertyRentInfo": { "rentAmount": 1500, "rentFrequency": 1, "frequencyType": 3, "depositAmount": 750, "depositScheme": "3351", "depositSchemeNo": null, "salePrice": null, "salePriceType": null, "emergencyResponseService": { "isERSEnabled": null, "eriProduct": null, "inceptionDate": null, "renewalDate": null, "cancelledDate": null }, "lastRentReview": "2021-10-21", "nextRentReview": "2022-10-21", "isLandlordArrearsExcluded": null, "aegisInsurance": null, "rentIndemnityProductId": null, "isRentIndeminityRequired": false, "isRentIndeminityEnabled": false, "premiumPercentage": null, "premiumAmount": null, "isUseRentPercentage": null, "rentStartDate": null, "rentStopDate": "2022-05-08", "manualClaim": null, "isClaimAuthorised": null, "managementCommission": 0, "vatInclusive": null, "secondLevelCommission": null, "narrativeForFees": null, "narrativeForFeesVat": null }, "propertyDescription": { "stopTapLocation": "Under SInk", "virtualTour": null, "publishedAddress": null, "epcRegisterUrl": "", "epcAssetRating": "5" }, "propertyRestrictionInfo": { "hasNoSmoker": true, "hasNoPets": false, "hasNoSharers": false, "hasNoChildren": true, "hasNoHousingBenefits": false, "hasNoStudent": null, "hasNoCorporate": null, "isSmokerNegotiable": false, "isPetsNegotiable": false, "isSharersNegotiable": false, "isChildrenNegotiable": true, "isHousingBenefitNegotiable": false, "isStudentNegotiable": false, "isCorporateNegotiable": false }, "bullets": { "bullet1": null, "bullet2": null, "bullet3": null, "bullet4": null, "bullet5": null, "bullet6": null, "bullet7": null, "bullet8": null, "bullet9": null, "bullet10": null }, "media": [{ "label": "Armada-House1", "fileName": "2021_45/55d19902-3e4b-492a-bc2a-4e10f6d49fe8.jpg", "description": "", "isInternal": false, "imageIndex": 1, "isEpc": false, "isFloorPlan": false, "isPublishOnLettingList": false, "isPublishOnWindowCards": false, "isPublishOnParticulars": false, "isPublishOnCarousel": false, "isPublishOnInternet": false, "mediaId": "55d19902-3e4b-492a-bc2a-4e10f6d49fe8" }, { "label": "EPC Image", "fileName": "2022_8/f80c12e6-0fcd-4d60-8b00-3485ef1209e7.png", "description": "EPC Image", "isInternal": null, "imageIndex": 2, "isEpc": true, "isFloorPlan": null, "isPublishOnLettingList": null, "isPublishOnWindowCards": true, "isPublishOnParticulars": null, "isPublishOnCarousel": null, "isPublishOnInternet": true, "mediaId": "f80c12e6-0fcd-4d60-8b00-3485ef1209e7" }, { "label": "download.jpg", "fileName": "2022_8/e0f8ed73-edfa-47bd-a5a9-ac58ae1c02ec.jpg", "description": "Safety Inspection", "isInternal": null, "imageIndex": 3, "isEpc": true, "isFloorPlan": null, "isPublishOnLettingList": null, "isPublishOnWindowCards": null, "isPublishOnParticulars": null, "isPublishOnCarousel": null, "isPublishOnInternet": null, "mediaId": "e0f8ed73-edfa-47bd-a5a9-ac58ae1c02ec" }], "propertyId": "d4ab9d6e-e2c8-427f-90e9-813446674036", "propcoId": 2068
    }
  }


  public images: any = ['assets/images/agent/propco-button.png', 'assets/images/agent/propco-button.png', 'assets/images/agent/propco-button.png', 'assets/images/agent/propco-button.png', 'assets/images/agent/propco-button.png'];
  sliderOpts = {
    zoom: false,
    slidesPerView: 1.5,
    spaceBetween: 20,
    centeredSlides: true
  };
 
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }

  ionViewDidEnter() {
    // this.slider.update();
  }


  async openPreview(img) {
    const modal = await this.modalCtrl.create({
      component: ImagePage,
      cssClass: 'transparent-modal',
      componentProps: {
        img
      }
    });
    modal.present();
  }

}
