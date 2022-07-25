import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HmrcPageRoutingModule } from './hmrc-routing.module';

import { HmrcPage } from './hmrc.page';
import { MaterialModule } from '../material.module';
import { SelfAssessmentFormComponent } from './self-assessment-form/self-assessment-form.component';
import { SelectLandlordsComponent } from './self-assessment-form/select-landlords/select-landlords.component';
import { DataTablesModule } from 'angular-datatables';
import { PipesModule } from '../shared/pipes/pipes.module';
import { SelectSearchAllDirective } from '../select-all-plus-search/select-search-all.directive';
import { SelectAllPlusSearchComponent } from '../select-all-plus-search/select-all-plus-search.component';
import { SelectDatesComponent } from './self-assessment-form/select-dates/select-dates.component';
import { OfficeFilterModalPageModule } from '../shared/modals/office-filter-modal/office-filter-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HmrcPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    DataTablesModule,
    PipesModule,
    OfficeFilterModalPageModule
  ],
  declarations: [
    HmrcPage,
    SelfAssessmentFormComponent,
    SelectLandlordsComponent,
    SelectSearchAllDirective,
    SelectAllPlusSearchComponent,
    SelectDatesComponent
  ],
  entryComponents: [SelectAllPlusSearchComponent]
})
export class HmrcPageModule { }
