import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgentService } from 'src/app/agent/agent.service';
import { DATE_FORMAT, HMO_LICENCE_CONFIG, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { PropertHmoLicence } from '../../workspace.model';

@Component({
  selector: 'app-compliance-records',
  templateUrl: './compliance-records.component.html',
  styleUrls: ['./compliance-records.component.scss'],
})
export class ComplianceRecordsComponent implements OnInit {
  @Input() propertyData: any;
  @Input() type: string;
  complianceForm: FormGroup;
  propertyInspection: any;
  propertyLicence: PropertHmoLicence[];
  currentDate = this.commonService.getFormatedDate(new Date(), DATE_FORMAT.YEAR_DATE);
  licenceSchemeLookupMap = new Map();
  licenceSchemeLookup: any;
  licenceStatusLookupMap = new Map();
  licenceStatusLookup: any;
  lookupdata: any;
  constructor(private fb: FormBuilder, private agentService: AgentService, private commonService: CommonService) { }

  ngOnInit() {
    this.getLookupData();
    this.initForm();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyData && !changes.propertyData.firstChange) {
      this.getInspection(this.propertyData.propertyId);
      const licenceList = await this.getPropertyLicence(this.propertyData.propertyId) as PropertHmoLicence[];
      if (licenceList) {
        this.propertyLicence = licenceList;
        this.checkHasHmoLicense(this.propertyLicence);
      }
    }
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

  private setLookupData(data: any) {
    this.licenceSchemeLookup = data.hmoLicenceSchemes;
    this.licenceStatusLookup = data.hmoStatuses;
    this.mapLookup();
  }

  private mapLookup() {
    this.licenceSchemeLookup.map((obj) => {
      this.licenceSchemeLookupMap.set(obj.index, obj.value);
    });
    this.licenceStatusLookup.map((obj) => {
      this.licenceStatusLookupMap.set(obj.index, obj.value);
    });
  }



  private initForm() {
    this.complianceForm = this.fb.group({
      hmoLicensed: [{ value: false, disabled: true }],
      hmoRisk: [{ value: HMO_LICENCE_CONFIG.HMO_RISK_DEFAULT, disabled: true }],
      hmoLicenceExpiryDate: [{ value: HMO_LICENCE_CONFIG.HMO_LICENCE_EXPIRY_DATE_DEFAULT, disabled: true }],
    });
  }

  private getInspection(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getInspection(propertyId, params).subscribe(
        (res) => {
          this.propertyInspection = res && res.data ? res.data[0] : '';
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  private getPropertyLicence(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getPropertyHMOLicence(propertyId, params).subscribe(
        (res) => {
          resolve(res && res.data ? res.data : []);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  private async patchLicenceForm(licenseData: PropertHmoLicence[]) {
    const filterHasHmoLicense = licenseData.filter(x => x.hmoLicensed);
    if (Array.isArray(filterHasHmoLicense) && filterHasHmoLicense.length > 0) {
      const hmoRisk = await this.checkHmoRisk(filterHasHmoLicense[0]);
      this.complianceForm.patchValue({
        hmoLicensed: licenseData[0].hmoLicensed,
        hmoRisk: hmoRisk,
        hmoLicenceExpiryDate: licenseData[0].hmoLicenceExpiryDate,
      });
    }
  }

  private async checkHmoRisk(license: PropertHmoLicence) {
    if (license.licenceSchemeLookup !== null && license.licenceSchemeLookup === HMO_LICENCE_CONFIG.NO_SCHEME && license.licenceStatusLookup === null) {
      return this.licenceSchemeLookupMap.get(license.licenceSchemeLookup);
    } else {
      return this.licenceStatusLookupMap.get(license.licenceStatusLookup);
    }
  }

  private checkHasHmoLicense(licenseData: PropertHmoLicence[]) {
    if (licenseData.length === 0) {
      return;
    }
    licenseData.forEach((data: PropertHmoLicence) => {
      const licenceIssueDateLocale = this.commonService.getFormatedDate(data.licenceIssueDate);
      const licenceExpiryDateLocale = this.commonService.getFormatedDate(data.licenceExpiryDate);
      if (data.isPropertyLicenced && licenceIssueDateLocale !== null && licenceExpiryDateLocale !== null
        && (licenceIssueDateLocale < this.currentDate || licenceExpiryDateLocale === this.currentDate)
        && (licenceExpiryDateLocale > this.currentDate || licenceExpiryDateLocale === this.currentDate)) {
        data.hmoLicensed = true;
        data.hmoLicenceExpiryDate = this.commonService.getFormatedDate(licenceExpiryDateLocale, DATE_FORMAT.DATE);
      }
    });
    this.patchLicenceForm(licenseData);
  }

}
