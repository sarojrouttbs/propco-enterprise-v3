import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormBuilder } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CommonService } from '../../services/common.service';


@Component({
  selector: 'app-search-property',
  templateUrl: './search-property.page.html',
  styleUrls: ['./search-property.page.scss'],
})
export class SearchPropertyPage {
  propertySearchForm: FormGroup;
  filteredProperty: Observable<FaultModels.IPropertyResponse>;
  propertyId;
  isFAF;
  isNotFound = false;
  officeList: any[] = [];
  agreementStatus: any;
  pageName: string;

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
      switchMap((value: string) => (value.length > 2) ? this.searchProperty(value, this.isFAF, this.officeList, this.agreementStatus, this.pageName) : new Observable())
    );
  }

  private initPropertySearchForm(): void {
    this.propertySearchForm = this.fb.group({
      text: ''
    });
  }

  private searchProperty(value: any, isFAF: boolean, officeList: any[], agreementStatus: any, pageName: string): Observable<any> {
    this.commonService.showLoader();
    this.isNotFound = false;

    let response = this.commonService.searchPropertyByText(value, isFAF, officeList, agreementStatus, pageName);
    response.subscribe(res => {
      this.isNotFound = res && res?.data.length > 0 ? false : true;
    },
      error => {
        console.log(error);
      }
    );
    return response;
  }

  onSelectionChange(data: any) {
    if (data) {
      this.propertyId = data.option.value.entityId;
      this.dismiss();
    }
  }

  getSuggestion(event: any) {
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
