import { ERROR_MESSAGE, FOLDER_NAMES, PROPCO } from './../../constants';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss', '../../drag-drop.scss'],
})
export class PropertyDetailsComponent implements OnInit {
  @Input() propertyDetails;
  @Input() parentForm: FormGroup;
  @Input() files;
  @Input() hmoDetails;
  @Input() urgencyStatus;
  @Input() faultId;
  @Input() createdAt;
  lookupdata: any;
  @Output()
  getUploadedFile = new EventEmitter<any>();
  advertisementRentFrequencies: any[];
  officeCodes: any[];
  hmoLicenceSchemes: any[];
  faultUrgencyStatuses: any[];
  @Input() communicationPreference
  showList = false;
  @Output() getStatus = new EventEmitter<any>();

  constructor(public commonService: CommonService, public sanitizer: DomSanitizer) {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData();
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.setLookupData();
      });
    }
    let faultsLookupData = this.commonService.getItem(PROPCO.FAULTS_LOOKUP_DATA, true);
    if (faultsLookupData) {
      this.setFaultsLookupData(faultsLookupData);
    }
    else {
      this.commonService.getFaultsLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.FAULTS_LOOKUP_DATA, data);
        this.setFaultsLookupData(data);
      });
    }

  }

  ngOnInit() {
  }

  private setLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.advertisementRentFrequencies = this.lookupdata.advertisementRentFrequencies;
    this.officeCodes = this.lookupdata.officeCodes;
    this.hmoLicenceSchemes = this.lookupdata.hmoLicenceSchemes;
  }

  private setFaultsLookupData(data) {
    this.faultUrgencyStatuses = data.faultUrgencyStatuses;
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }
  public submit(files: FileList) {
    this.getUploadedFile.emit(files);
  }

  getFilteredDocs(files: Array<any>): string {
    let url = null;
    if (files && files[0].documentId) {
      const filteredDoc = files.filter(data => data.folderName === FOLDER_NAMES[0]['index']);
      if (filteredDoc.length && filteredDoc[0].name.split('.')[1] !== 'pdf') {
        return url = filteredDoc[0].documentUrl;
      }
      else
        return url = 'assets/images/default.jpg';
    }
    if (files && !files[0].documentId) {
      return url = files[0].documentUrl;
    }
  }

  toggleStatusList() {
    this.showList = !this.showList;
  }

  async selectedStatus(statusType) {
    const response = await this.commonService.showConfirm('Change Urgency Status', 'This will change the urgency status. Are you sure you want to proceed?', '', 'Submit', 'Cancel');
    if (response) {
      this.urgencyStatus = statusType;
      this.getStatus.emit(statusType);
      this.toggleStatusList();
    } else {
      this.commonService.showMessage(ERROR_MESSAGE.DEFAULT, 'Change Urgency Status', 'Error');
    }

  }
}
