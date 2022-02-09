import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchResultsPageRoutingModule } from './search-results-routing.module';

import { SearchResultsPage } from './search-results.page';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from 'src/app/material.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchResultsPageRoutingModule,
    SharedModule,
    MaterialModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    NgxSliderModule
  ],
  declarations: [SearchResultsPage]
})
export class SearchResultsPageModule {}