import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { ValidationService } from 'src/app/shared/services/validation.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  propertyDetailsForm: FormGroup;
  propertyDetails: any;
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  activeLink: any;

  constructor(private router: Router, private agentService: AgentService, private commonService: CommonService, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initAPIcalls();
  }

  private async initAPIcalls() {
    this.createForm();
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
    await this.patchLettingsDetails();
    await this.patchLetBoardDetails();
    await this.patchPropertyHistory();
    await this.patchPropertyAddressDetails();
    this.getPropertyLocationsByPropertyId(this.selectedEntityDetails.entityId);
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
        internalNotes: [''], //* - pending
        fileNumber: [''],
        azReference: ['']
      }),
      letBoardForm: this._formBuilder.group({
        isBoardAllowed: [false],
        boardOrderedOn: [''],
        boardRemovedOn: [''],
        slipOrderedOn: [''],
        boardRef: ['']
      }),
      history: this._formBuilder.group({
        createdAt: [''],
        createdBy: [''], //* - pending
        statusChangedOn: [''],
        statusChangedBy: [''], //* - pending
        maStatusChangedOn: [''],
        maStatusChangedBy: [''] //* - pending
      }),
      propertyAddressForm : this._formBuilder.group({
        postcode: ['', [Validators.required, ValidationService.postcodeValidator]],
        addressdetails: [''],
        buildingNumber: [''],
        buildingName: [''],
        street: [''],
        addressLine1: ['', Validators.required],
        addressLine2: ['', Validators.required],
        addressLine3: [''],
        locality: [''],
        town: ['', Validators.required],
        county: [''],
        country: [''],
        latitude: [''],
        longitude: [''],
        pafref:[''],
        organisationName:[''],
        floor:[''],
        block:['']
      })
    })
  }

  getPropertyDetails(propertyId) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
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

  private patchLettingsDetails() {
    const control = this.propertyDetailsForm.controls['lettingsDetailsForm'];
    control.patchValue({
      status: this.propertyDetails?.propertyInfo?.status ? this.propertyDetails?.propertyInfo?.status.toString() : '',
      maStatus: this.propertyDetails?.propertyInfo?.maStatus ? this.propertyDetails?.propertyInfo?.maStatus.toString() : '',
      managementType: this.propertyDetails?.propertyInfo?.managementType ? this.propertyDetails?.propertyInfo?.managementType.toString() : '',
      rentCategory: this.propertyDetails?.propertyInfo?.rentCategory ? this.propertyDetails?.propertyInfo?.rentCategory : '',
      hmoPropertyRef: this.propertyDetails?.propertyInfo?.hmoPropertyRef ? this.propertyDetails?.propertyInfo?.hmoPropertyRef : '',
      isHmoProperty: this.propertyDetails?.propertyInfo?.isHmoProperty ? this.propertyDetails?.propertyInfo?.isHmoProperty : false,
      officeCode: this.propertyDetails?.propertyInfo?.officeCode ? this.propertyDetails?.propertyInfo?.officeCode : '',
      acquisitionOffice: this.propertyDetails?.propertyInfo?.acquisitionOffice ? this.propertyDetails?.propertyInfo?.acquisitionOffice : '',
      bookingOfficeCode: this.propertyDetails?.propertyInfo?.bookingOfficeCode ? this.propertyDetails?.propertyInfo?.bookingOfficeCode : '',
      legacyReference: this.propertyDetails?.propertyDetails?.legacyReference ? this.propertyDetails?.propertyDetails?.legacyReference : '',
      memberNo: this.propertyDetails?.propertyDetails?.memberNo ? this.propertyDetails?.propertyDetails?.memberNo : '',
      portfolioSource: this.propertyDetails?.propertyInfo?.portfolioSource ? this.propertyDetails?.propertyInfo?.portfolioSource : '',
      lettingReason: this.propertyDetails?.propertyDetails?.lettingReason ? this.propertyDetails?.propertyDetails?.lettingReason : '',
      isOnWithOtherAgent: this.propertyDetails?.propertyInfo?.isOnWithOtherAgent ? this.propertyDetails?.propertyInfo?.isOnWithOtherAgent : false,
      agentName: this.propertyDetails?.propertyInfo?.agentName ? this.propertyDetails?.propertyInfo?.agentName : '',
      appraisedDate: this.propertyDetails?.propertyDetails?.appraisedDate ? this.propertyDetails?.propertyDetails?.appraisedDate : '',
      instructedDate: this.propertyDetails?.propertyDetails?.instructedDate ? this.propertyDetails?.propertyDetails?.instructedDate : '',
      floorArea: this.propertyDetails?.propertyDetails?.floorArea ? this.propertyDetails?.propertyDetails?.floorArea : '',
      phoneOne: this.propertyDetails?.propertyDetails?.phoneOne ? this.propertyDetails?.propertyDetails?.phoneOne : '',
      phoneTwo: this.propertyDetails?.propertyDetails?.phoneTwo ? this.propertyDetails?.propertyDetails?.phoneTwo : '',
      internalNotes:  '', // pending
      fileNumber: this.propertyDetails?.propertyInfo?.fileNumber ? this.propertyDetails?.propertyInfo?.fileNumber : '',
      azReference: this.propertyDetails?.propertyWebInfo?.azReference ? this.propertyDetails?.propertyWebInfo?.azReference : '',
    });
  }

  private patchLetBoardDetails() {
    const control = this.propertyDetailsForm.controls['letBoardForm'];
    control.patchValue({
      isBoardAllowed: this.propertyDetails?.propertyInfo?.isBoardAllowed,
      boardOrderedOn: this.propertyDetails?.propertyInfo?.boardOrderedOn ? this.commonService.getFormatedDate(this.propertyDetails.propertyInfo.boardOrderedOn , 'dd/MM/yyyy') : '-',
      boardRemovedOn: this.propertyDetails?.propertyInfo?.boardRemovedOn ? this.commonService.getFormatedDate(this.propertyDetails.propertyInfo.boardRemovedOn, 'dd/MM/yyyy') : '-',
      slipOrderedOn: this.propertyDetails?.propertyInfo?.slipOrderedOn ? this.commonService.getFormatedDate(this.propertyDetails.propertyInfo.slipOrderedOn, 'dd/MM/yyyy') : '-',
      boardRef: this.propertyDetails?.propertyInfo?.boardRef ? this.propertyDetails?.propertyInfo?.boardRef : '-'
    });
  }

  private patchPropertyHistory() {
    const control = this.propertyDetailsForm.controls['history'];
    control.patchValue({
      createdAt: this.propertyDetails?.createdAt ? this.commonService.getFormatedDate(this.propertyDetails.createdAt, 'dd/MM/yyyy') : '-',
      createdBy: '', //* - pending
      statusChangedOn: this.propertyDetails?.propertyInfo?.statusChangedOn ? this.commonService.getFormatedDate(this.propertyDetails.propertyInfo.statusChangedOn, 'dd/MM/yyyy') : '-',
      statusChangedBy: '', //* - pending
      maStatusChangedOn: this.propertyDetails?.propertyInfo?.maStatusChangedOn ? this.commonService.getFormatedDate(this.propertyDetails.propertyInfo.maStatusChangedOn, 'dd/MM/yyyy') : '-',
      maStatusChangedBy: '' //* - pending
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
      pafref:this.propertyDetails?.propertyInfo?.address.pafReference,
      organisationName: this.propertyDetails?.propertyInfo?.address.organisationName,
      floor: this.propertyDetails?.propertyDetails?.floor,
      block: this.propertyDetails?.propertyInfo?.block,
    });
  }

  private getPropertyLocationsByPropertyId(propertyId: string) {
    let params = new HttpParams().set("hideLoader", "true");
    this.agentService.getPropertyLocationsByPropertyId(propertyId, params).subscribe(
      res => {
        const propertylocationIds: any = [];
        if(res && res.data) {
          res.data.forEach(element => {
            propertylocationIds.push(element.locationId)
          });
          const control = this.propertyDetailsForm.controls['lettingsDetailsForm'];
          control.patchValue({propertyLocations: propertylocationIds})
        }
      }
    );
  }
}