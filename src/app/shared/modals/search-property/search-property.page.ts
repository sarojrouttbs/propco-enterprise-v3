import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { switchMap, debounceTime, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { PROPCO } from '../../constants';
import { HttpParams } from '@angular/common/http';
import { SolrService } from 'src/app/solr/solr.service';


@Component({
  selector: 'app-search-property',
  templateUrl: './search-property.page.html',
  styleUrls: ['./search-property.page.scss'],
})
export class SearchPropertyPage {
  propertySearchForm = new FormControl('');
  filteredProperty: any;
  propertyId;
  isFAF;
  isNotFound = false;
  officeList: any[] = [];
  agreementStatus: any;
  pageName: string;
  isSolrDashboard;
  types;
  solrPageTitle;
  officeLookupMap = new Map();
  officeLookupDetails: any;
  lookupdata: any;
  solrSelectedItemPropcoId = null;
  value;
  cardType;
  propertyStatuses: any;
  landlordStatuses: any;
  agentStatuses: any;
  applicantStatuses: any;
  contractorStatuses: any;
  tenantStatuses: any;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private fb: FormBuilder,
    private commonService: CommonService,
    private solrService: SolrService) {
    this.isFAF = this.navParams.get('isFAF');
    this.isSolrDashboard = this.navParams.get('isSolrDashboard');
    this.officeList = this.navParams.get('officeList');
    this.agreementStatus = this.navParams.get('agreementStatus');
    this.solrPageTitle = this.navParams.get('solrPageTitle');
    this.getLookupData();
    this.propertySearchForm.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
      if (value && value.length > 2) {
        if (this.isSolrDashboard) {
          this.solrSelectedItemPropcoId = null;
        }
        this.searchProperty(value, this.isFAF, this.officeList, this.agreementStatus, this.pageName);
      }
    });
  }

  private searchProperty(value: any, isFAF: boolean, officeList: any[], agreementStatus: any, pageName: string): Observable<any> {
    this.commonService.showLoader();
    this.isNotFound = false;

    if (!this.isSolrDashboard) {
      let response = this.commonService.searchPropertyByText(value, isFAF, officeList, agreementStatus, pageName);
      response.subscribe(res => {
        this.isNotFound = res && res?.data.length > 0 ? false : true;
        this.filteredProperty = res && res?.data.length > 0 ? res?.data : [];
      },
        error => {
          console.log(error);
        }
      );
      return response;
    } else {
      let response = this.solrService.entityGetSuggestion(new HttpParams()
        .set('searchTerm', value)
        .set('searchTypes', this.types)
        .set('searchSwitch', true));
      response.subscribe(res => {
        this.isNotFound = res ? false : true;
        this.filteredProperty = res && res.length > 0 ? res : [];
        this.filteredProperty.forEach((r) => {
          if(r?.statusId) {
            switch (r.entityType) {
              case 'PROPERTY':
                r.status = this.solrService.fetchLabel(r.statusId, this.propertyStatuses);
                break;
              case 'LANDLORD':
                r.status = this.solrService.fetchLabel(r.statusId, this.landlordStatuses);
                break;
              case 'COTENANT':
                r.status = this.solrService.fetchLabel(r.statusId, this.tenantStatuses);
                break;
              case 'TENANT':
                r.status = this.solrService.fetchLabel(r.statusId, this.tenantStatuses);
                break;
              case 'APPLICANT':
                r.status = this.solrService.fetchLabel(r.statusId, this.applicantStatuses);
                break;
              case 'AGENT':
                r.status = this.solrService.fetchLabel(r.statusId, this.agentStatuses);
                break;
              case 'CONTRACTOR':
                r.status = this.solrService.fetchLabel(r.statusId, this.contractorStatuses);
                break;
            }
          }
        });
      },
        error => {
          console.log(error);
        }
      );
      return response;
    }
  }

  onSelectionChange(data: any) {
    if (data) {
      if (!this.isSolrDashboard) {
        if (data.option.value) {
          this.propertyId = data.option.value.entityId;
          this.dismiss();
        }
      } else {
        this.solrSelectedItemPropcoId = null;
        this.propertySearchForm.markAsUntouched();
        this.propertySearchForm.setValue(`${data.option.value.name} (PropCo ID#: ${data.option.value.propcoId})`, { onlySelf: true, emitEvent: false });
        this.solrSelectedItemPropcoId = data.option.value.propcoId;
      }
    }
  }

  getSuggestion(event: any) {
    if (event && event.detail.value && event.detail.value.length > 2) {
      this.filteredProperty = this.commonService.searchPropertyByText(event.detail.value);
    } else {
      this.filteredProperty = new Observable<FaultModels.IPropertyResponse>();
    }
  }

  resetSearch() {
    if (this.isSolrDashboard) {
      this.solrSelectedItemPropcoId = null;
    }
    this.filteredProperty = null;
    console.log(this.filteredProperty)
    this.propertySearchForm.setValue('');
  }

  dismiss() {
    if (this.isSolrDashboard) {
      this.modalController.dismiss();
    }
    this.modalController.dismiss({
      propertyId: this.propertyId
    });
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe((data) => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }
  private setLookupData(data) {
    this.setOfficeLookupMap(data.officeCodes);
    this.propertyStatuses = data.propertyStatuses;
    this.landlordStatuses = data.landlordStatuses;
    this.tenantStatuses = data.tenantStatuses;
    this.applicantStatuses = data.applicantStatuses;
    this.contractorStatuses = data.contractorStatuses;
    this.agentStatuses = data.agentStatuses;
  }

  private setOfficeLookupMap(data) {
    if (data) {
      this.officeLookupDetails = data;
      data.map((occ) => {
        this.officeLookupMap.set(occ.index, occ.value);
      });
    }
  }

  async dismissToSolrDashboard(action?: string) {
    let message = '';
    if (action === 'skip') {
      this.modalController.dismiss({ action: action, id: null });
    } else if (action === 'copy') {
      if (this.cardType === 'OpenApplicantCard') {
        message = 'Personal details will be copied from an existing record, please sense check the data before finishing the process.';
      } else {
        message = 'Personal details will be copied from an existing record, please sense check the data before finishing the process.';
      }
      await this.commonService.showAlert(this.solrPageTitle, message);
      this.modalController.dismiss({ action: action, id: this.solrSelectedItemPropcoId });
    } else {
      if (this.cardType === 'OpenApplicantCard') {
        message = 'A new record will not be created. Upon clicking OK, the Applicant Card will load for the selected record.';
      } else {
        message = 'A new record will not be created. Upon clicking OK, the MA Form will load for the selected record.';
      }
      await this.commonService.showAlert(this.solrPageTitle, message);
      this.modalController.dismiss({ action: action, id: this.solrSelectedItemPropcoId });
    }
  }
}
