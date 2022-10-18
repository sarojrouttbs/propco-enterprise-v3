import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DEFAULTS, ENTITY_TYPE, DATE_FORMAT } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit, OnDestroy {
  propertyDetailsForm: FormGroup;
  propertyDetails: any;
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  activeLink: any;
  isMenuShown = true;
  DATE_FORMAT = DATE_FORMAT;
  isPropertyAddressAvailable = false;

  private unsubscribe = new Subject<void>();
  formStatus: FormStatus.Saving | FormStatus.Saved | FormStatus.Idle = FormStatus.Idle;
  formChangedValue: any;

  constructor(private router: Router,
    private agentService: AgentService,
    private commonService: CommonService,
    private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initApiCalls();
  }

  private async initApiCalls() {
    this.createForm();
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
    this.patchLettingsDetails();
    this.patchLetBoardDetails();
    this.patchPropertyHistory();
    this.patchPropertyChecks();
    this.patchPropertyAddressDetails();
    this.getPropertyLocationsByPropertyId(this.selectedEntityDetails.entityId);
    this.updateDetails();
  }

  updateDetails() {
    this.propertyDetailsForm.valueChanges.pipe(
      debounceTime(1000),
      tap(() => {
        this.formStatus = FormStatus.Saving;
        this.commonService.showAutoSaveLoader(this.formStatus);
        const changedData = this.commonService.getDirtyValues(this.propertyDetailsForm);
        const controlName = Object.keys(changedData);
        this.formChangedValue = changedData[controlName[0]] ?? {};
      }),
      switchMap((value) => {
        if(Object.keys(this.formChangedValue).length > 0) {
          return this.agentService.updatePropertyDetails(this.selectedEntityDetails.entityId, this.formChangedValue);
        }
      }),
      takeUntil(this.unsubscribe)
      ).subscribe(async (value) => {
        this.propertyDetailsForm.markAsPristine();
        this.propertyDetailsForm.markAsUntouched();
        this.formStatus = FormStatus.Saved;
        this.commonService.showAutoSaveLoader(this.formStatus);
        await this.sleep(2000);
        if (this.formStatus === FormStatus.Saved) {
          this.formStatus = FormStatus.Idle;
          this.commonService.showAutoSaveLoader(this.formStatus);
        }
      }, (error) => {
        this.propertyDetailsForm.markAsPristine();
        this.propertyDetailsForm.markAsUntouched();
        this.formStatus = FormStatus.Idle;
        this.commonService.showAutoSaveLoader(this.formStatus);
        this.updateDetails();
      }
    );
  }

  sleep(ms: number): Promise<any> {
    return new Promise((res) => setTimeout(res, ms));
  }

  private fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getActiveTabEntityInfo() {
    let item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      this.router.navigate([
        `agent/workspace/property/${item[0].entityId}/details`,
      ]);
      this.activeLink = item[0].entityId;
      return item[0];
    }
  }

  private createForm() {
    this.propertyDetailsForm = this._formBuilder.group({
      lettingsDetailsForm: this._formBuilder.group({
        status: [''],
        maStatus: [''],
        managementType: ['', Validators.required],
        rentCategory: [''],
        hmoPropertyRef: [''],
        isHmoProperty: [false],
        officeCode: ['', Validators.required],
        propertyLocations: ['', Validators.required], //* Pending
        acquisitionOffice: [''],
        bookingOfficeCode: [''],
        legacyReference: [''],
        memberNo: [''],
        portfolioSource: [''],
        lettingReason: [''],
        isOnWithOtherAgent: [],
        agentName: [''],
        appraisedDate: [''],
        instructedDate: [''],
        floorArea: [''],
        phoneOne: [''],
        phoneTwo: [''],
        internalNote: [''],
        fileNumber: [''],
        azReference: [''],
        marketingAs: [''],
        landlordOccupancy: [''],
        withdrawnReason: ['']
      }),
      letBoardForm: this._formBuilder.group({
        isBoardAllowed: [false],
        boardOrderedDate: [''],
        boardRemovedDate: [''],
        slipOrderedDate: [''],
        boardRef: ['']
      }),
      history: this._formBuilder.group({
        createdAt: [''],
        createdBy: [''],
        statusChangedOn: [''],
        statusChangedBy: [''],
        maStatusChangedOn: [''],
        maStatusChangedBy: ['']
      }),
      propertyChecksForm: this._formBuilder.group({
        hasLetBefore: [''],
        hasGas: [''],
        hasPat: [''],
        hasPortableAppliances: [''],
        hasOil: [''],
        hasSolidFuel: [''],
        smokeDetectors: [''],
        numberOfSmokeAlarms: [''],
        hasElectricalIndemnitySigned: [''],
        carbonMonoxideDetectors: [''],
        numberOfCOAlarms: null,
        numberOfFireBlankets: [''],
        numberOfFireExtinguishers: ['']
      }),
      propertyAddressForm: this._formBuilder.group({
        postcode: ['', [Validators.required, ValidationService.postcodeValidator]],
        addressdetails: [''],
        buildingNumber: [''],
        buildingName: [''],
        street: [''],
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        addressLine3: [''],
        locality: [''],
        town: ['', Validators.required],
        county: [''],
        country: [''],
        latitude: [''],
        longitude: [''],
        pafref: [''],
        organisationName: [''],
        floor: [''],
        block: [''],
        room: ['']
      })
    })
  }

  getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          resolve(res.data);
        },
        (_error) => {
          resolve(false);
        }
      );
    });
  }

  private patchLettingsDetails() {
    const control = this.propertyDetailsForm.controls['lettingsDetailsForm'];
    control.patchValue(this.propertyDetails?.propertyInfo);
    control.patchValue(this.propertyDetails?.propertyDetails);
    control.patchValue({
      status: this.propertyDetails?.propertyInfo?.status ? this.propertyDetails?.propertyInfo?.status.toString() : '',
      maStatus: this.propertyDetails?.propertyInfo?.maStatus ? this.propertyDetails?.propertyInfo?.maStatus.toString() : '',
      managementType: this.propertyDetails?.propertyInfo?.managementType ? this.propertyDetails?.propertyInfo?.managementType.toString() : '',
      isHmoProperty: this.propertyDetails?.propertyInfo?.isHmoProperty ? this.propertyDetails?.propertyInfo?.isHmoProperty : false,
      isOnWithOtherAgent: this.propertyDetails?.propertyInfo?.isOnWithOtherAgent ? this.propertyDetails?.propertyInfo?.isOnWithOtherAgent : false,
      internalNote: this.propertyDetails?.propertyDescription?.internalNote ? this.propertyDetails?.propertyDescription?.internalNote : '',
      azReference: this.propertyDetails?.propertyWebInfo?.azReference ? this.propertyDetails?.propertyWebInfo?.azReference : ''
    });
  }

  private patchLetBoardDetails() {
    const control = this.propertyDetailsForm.controls['letBoardForm'];
    control.patchValue(this.propertyDetails?.propertyInfo);
  }

  private async patchPropertyHistory() {
    await this.getChangeHistory(this.selectedEntityDetails.entityId, 'marketingStatus');
    await this.getChangeHistory(this.selectedEntityDetails.entityId, 'status');
    const control = this.propertyDetailsForm.controls['history'];
    control.patchValue({
      createdAt: this.propertyDetails?.createdAt ? this.commonService.getFormatedDate(this.propertyDetails.createdAt, this.DATE_FORMAT.DATE) : DEFAULTS.NOT_AVAILABLE,
      createdBy: this.propertyDetails?.createdBy ? this.propertyDetails?.createdBy : DEFAULTS.NOT_AVAILABLE,
      statusChangedOn: this.propertyDetails?.propertyInfo?.statusChangedOn ? this.commonService.getFormatedDate(this.propertyDetails.propertyInfo.statusChangedOn, this.DATE_FORMAT.DATE) : DEFAULTS.NOT_AVAILABLE,
      statusChangedBy: this.propertyDetails?.propertyInfo?.statusChangedBy ? this.propertyDetails?.propertyInfo?.statusChangedBy : DEFAULTS.NOT_AVAILABLE,
      maStatusChangedOn: this.propertyDetails?.propertyInfo?.maStatusChangedOn ? this.commonService.getFormatedDate(this.propertyDetails.propertyInfo.maStatusChangedOn, this.DATE_FORMAT.DATE) : DEFAULTS.NOT_AVAILABLE,
      maStatusChangedBy: this.propertyDetails?.propertyInfo?.maStatusChangedBy ? this.propertyDetails?.propertyInfo?.maStatusChangedBy : DEFAULTS.NOT_AVAILABLE
    });
  }

  private patchPropertyChecks() {
    const control = this.propertyDetailsForm.controls['propertyChecksForm'];
    control.patchValue({
      hasLetBefore: this.propertyDetails?.propertyDetails?.hasLetBefore ? this.propertyDetails?.propertyDetails?.hasLetBefore : false,
      hasGas: this.propertyDetails?.propertyDetails?.hasGas ? this.propertyDetails?.propertyDetails?.hasGas : false,
      hasPat: this.propertyDetails?.propertyDetails?.hasPat ? this.propertyDetails?.propertyDetails?.hasPat : false,
      hasPortableAppliances: this.propertyDetails?.propertyDetails?.hasPortableAppliances ? this.propertyDetails?.propertyDetails?.hasPortableAppliances : false,
      hasOil: this.propertyDetails?.propertyDetails?.hasOil ? this.propertyDetails?.propertyDetails?.hasOil : false,
      hasSolidFuel: this.propertyDetails?.propertyDetails?.hasSolidFuel ? this.propertyDetails?.propertyDetails?.hasSolidFuel : false,
      smokeDetectors: this.propertyDetails?.smokeDetectors ? this.propertyDetails?.smokeDetectors : '',
      numberOfSmokeAlarms: this.propertyDetails?.numberOfSmokeAlarms ? this.propertyDetails?.numberOfSmokeAlarms : '',
      hasElectricalIndemnitySigned: this.propertyDetails?.propertyDetails?.hasElectricalIndemnitySigned ? this.propertyDetails?.propertyDetails?.hasElectricalIndemnitySigned : false,
      carbonMonoxideDetectors: this.propertyDetails?.carbonMonoxideDetectors ? this.propertyDetails?.carbonMonoxideDetectors : '',
      numberOfCOAlarms: this.propertyDetails?.numberOfCOAlarms ? this.propertyDetails?.numberOfCOAlarms : '',
      numberOfFireBlankets: this.propertyDetails?.numberOfFireBlankets ? this.propertyDetails?.numberOfFireBlankets : '',
      numberOfFireExtinguishers: this.propertyDetails?.numberOfFireExtinguishers ? this.propertyDetails?.numberOfFireExtinguishers : ''
    });
  }

  private patchPropertyAddressDetails() {
    const control = this.propertyDetailsForm.controls['propertyAddressForm'];
    control.patchValue({
      postcode: this.propertyDetails?.propertyInfo?.address.postcode,
      addressdetails: [''],
      buildingNumber: this.propertyDetails?.propertyInfo?.address.buildingNumber,
      buildingName: this.propertyDetails?.propertyInfo?.address.buildingName,
      street: this.propertyDetails?.propertyInfo?.address.street,
      addressLine1: this.propertyDetails?.propertyInfo?.address.addressLine1,
      addressLine2: this.propertyDetails?.propertyInfo?.address.addressLine2,
      addressLine3: this.propertyDetails?.propertyInfo?.address.addressLine3,
      locality: this.propertyDetails?.propertyInfo?.address.locality,
      town: this.propertyDetails?.propertyInfo?.address.town,
      county: this.propertyDetails?.propertyInfo?.address.county,
      country: this.propertyDetails?.propertyInfo?.address.country,
      latitude: this.propertyDetails?.propertyInfo?.address.latitude,
      longitude: this.propertyDetails?.propertyInfo?.address.longitude,
      pafref: this.propertyDetails?.propertyInfo?.address.pafReference,
      organisationName: this.propertyDetails?.propertyInfo?.address.organisationName,
      floor: this.propertyDetails?.propertyDetails?.floor,
      block: this.propertyDetails?.propertyInfo?.block,
      room: this.propertyDetails?.propertyInfo?.room
    });
    this.isPropertyAddressAvailable = true;
  }

  private getPropertyLocationsByPropertyId(propertyId: string) {
    let params = new HttpParams().set('hideLoader', 'true');
    this.agentService.getPropertyLocationsByPropertyId(propertyId, params).subscribe(
      res => {
        if (res && res.data) {
          const propertylocationIds: any = [];
          res.data.forEach(element => {
            propertylocationIds.push(element.locationId)
          });
          const control = this.propertyDetailsForm.controls['lettingsDetailsForm'];
          control.patchValue({ propertyLocations: propertylocationIds })
        }
      });
  }

  private getChangeHistory(propertyId: string, fieldName: string) {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('entityId', propertyId)
      .set('entityType', ENTITY_TYPE.PROPERTY)
      .set('fieldName', fieldName);
    return new Promise((resolve) => {
      this.agentService.getChangeHistory(params).subscribe(
        (res) => {
          if (res && fieldName === 'marketingStatus') {
            this.propertyDetails.propertyInfo.maStatusChangedBy = res[0].changedBy;
          } else if (res && fieldName === 'status') {
            this.propertyDetails.propertyInfo.statusChangedBy = res[0].changedBy;
          }
          resolve(true);
        },
        (_error) => {
          resolve(false);
        }
      );
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next()
  }
}

enum FormStatus {
  Saving = 'Saving...',
  Saved = 'Saved!',
  Idle = '',
}