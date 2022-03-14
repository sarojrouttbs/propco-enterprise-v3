import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchResultsPageRoutingModule } from './search-results-routing.module';

import { SearchResultsPage } from './search-results.page';
import { MaterialModule } from 'src/app/material.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ReplaceSquareBracketsPipe } from '../pipes/replace-square-brackets.pipe';
import { RemainingCountPipe } from '../pipes/remaining-count.pipe';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchResultsPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
    NgxSliderModule,
    ComponentsModule
  ],
  declarations: [SearchResultsPage,ReplaceSquareBracketsPipe,RemainingCountPipe]
})
export class SearchResultsPageModule {}
