import { ERROR_MESSAGE, DOCUMENTS_TYPE, PROPCO, DEFAULTS } from './../../constants';
import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { ContactDetailsModalPage } from '../../modals/contact-details-modal/contact-details-modal.page';

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
  @Input() dppRepairDetails;
  @Input() communicationPreference;
  @Output() getUploadedFile = new EventEmitter<any>();
  @Output() getStatus = new EventEmitter<any>();
  lookupdata: any;
  advertisementRentFrequencies: any[];
  officeCodes: any[];
  hmoLicenceSchemes: any[];
  faultUrgencyStatuses: any[];
  faultCommunicationPreferences: any[];
  showList = false;
  @Input() landlordDetails;
  @Input() leadTenantId;
  @Input() sourceType;
  @Input() fixfloTenantContact;
  @Input() isPropertyCardReady;
  @Input() hasPropertyCheckedIn;
  DEFAULTS = DEFAULTS;

  constructor(public commonService: CommonService, public sanitizer: DomSanitizer, public modalController: ModalController) {
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

  ngOnChanges(changes: SimpleChanges) {
    // if (changes.propertyDetails && changes.propertyDetails.currentValue) {
    //   this.propertyDetails = changes.propertyDetails.currentValue;
    // }
    if(changes.landlordDetails && changes.landlordDetails.currentValue){
      this.landlordDetails = changes.landlordDetails.currentValue;           
    }
    if(changes.leadTenantId && changes.leadTenantId.currentValue){
      this.leadTenantId = changes.leadTenantId.currentValue;           
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
    this.faultCommunicationPreferences = data.faultCommunicationPreferences;
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
      const filteredDoc = files.filter(data => data.folderName === 'initial issue');
      if (filteredDoc.length && DOCUMENTS_TYPE.indexOf(filteredDoc[0].name.split('.')[1]) == -1) {
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

  async contactDetailModal() {
    const modal = await this.modalController.create({
      component: ContactDetailsModalPage,
      cssClass: 'modal-container contact-details-modal',
      componentProps: {
        landlordDetails: this.landlordDetails,
        tenantId: this.leadTenantId,
        hasPropertyCheckedIn: this.hasPropertyCheckedIn
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
    });
    await modal.present();
  }
}
