import { Component, OnInit } from '@angular/core';

import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FaultsService } from 'src/app/faults/faults.service';
import { switchMap, debounceTime } from 'rxjs/operators';
// import { IPropertyResponse } from '../../../faults/details/details-model';
import { Observable } from 'rxjs';
import { PlatformLocation } from '@angular/common';
import { CommonService } from '../../services/common.service';


@Component({
  selector: 'app-search-property',
  templateUrl: './search-property.page.html',
  styleUrls: ['./search-property.page.scss'],
})
export class SearchPropertyPage implements OnInit {
  propertySearchForm: FormGroup;
  filteredProperty: Observable<FaultModels.IPropertyResponse>;
  propertyId;
  isFAF;
  isNotFound: boolean = false;
  officeList: any[] = [];
  agreementStatus: any;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private fb: FormBuilder,
    private commonService: CommonService) {
    this.isFAF = this.navParams.get('isFAF');
    this.officeList = this.navParams.get('officeList');
    this.agreementStatus = this.navParams.get('agreementStatus');


    this.initPropertySearchForm();
    this.filteredProperty = this.propertySearchForm.get('text').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value.length > 2) ? this.searchProperty(value, this.isFAF, this.officeList, this.agreementStatus) : new Observable())
    );
  }

  ngOnInit() {
  }

  initPropertySearchForm(): void {
    this.propertySearchForm = this.fb.group({
      text: ''
    });
  }

  private searchProperty(value: any, isFAF: boolean, officeList: any[], agreementStatus: any): Observable<any> {
    this.isNotFound = false;

    let response = this.commonService.searchPropertyByText(value, isFAF, officeList, agreementStatus);
    response.subscribe(res => {
      this.isNotFound = res && res?.data.length > 0 ? false : true;
    },
      error => {
        console.log(error);
      }
    );
    return response;
  }

  private searchNot() {

  }

  onSelectionChange(data) {
    if (data) {
      this.propertyId = data.option.value.entityId;
      this.dismiss();
    }
  }

  getSuggestion(event) {
    if (event && event.detail.value && event.detail.value.length > 2) {
      this.filteredProperty = this.commonService.searchPropertyByText(event.detail.value);
    } else {
      this.filteredProperty = new Observable<FaultModels.IPropertyResponse>();
    }
  }

  dismiss() {
    this.modalController.dismiss({
      propertyId: this.propertyId
    });
  }
}
