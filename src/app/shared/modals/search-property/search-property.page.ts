import { Component, OnInit } from '@angular/core';

import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormBuilder } from '@angular/forms';
import { FaultsService } from 'src/app/faults/faults.service';
import { switchMap, debounceTime } from 'rxjs/operators';
import { IPropertyResponse } from '../../../faults/details/details-model';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-search-property',
  templateUrl: './search-property.page.html',
  styleUrls: ['./search-property.page.scss'],
})
export class SearchPropertyPage implements OnInit {
  propertySearchForm: FormGroup;
  filteredProperty: Observable<IPropertyResponse>;
  propertyId;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private fb: FormBuilder,
    private faultService: FaultsService
  ) {
    this.initPropertySearchForm();
    this.filteredProperty = this.propertySearchForm.get('text').valueChanges.pipe(debounceTime(300),
      switchMap(value => this.faultService.searchPropertyByText(value))
    );
  }

  ngOnInit() {
  }
  initPropertySearchForm(): void {
    this.propertySearchForm = this.fb.group({
      text: ''
    });
  }

  onSelectionChange(data) {
    if (data) {
      this.propertyId = data.option.value.entityId;
      this.dismiss();
    }
  }

  getSuggestion(event) {
    if (event && event.detail.value && event.detail.value.length > 2) {
      this.filteredProperty = this.faultService.searchPropertyByText(event.detail.value);
    } else {
      this.filteredProperty = new Observable<IPropertyResponse>();
    }
  }

  dismiss() {
    this.modalController.dismiss({
      'propertyId': this.propertyId
    });
  }
}
