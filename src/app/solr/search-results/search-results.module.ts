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
import { ReplaceSquareBracketsPipe } from '../pipes/replace-square-brackets.pipe';
import { ShowRemainingCountPipe } from '../pipes/show-remaining-count.pipe';

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
  declarations: [SearchResultsPage,ReplaceSquareBracketsPipe,ShowRemainingCountPipe]
})
export class SearchResultsPageModule {}
