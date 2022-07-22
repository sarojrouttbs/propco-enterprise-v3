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
import { PreviewAndSendComponent } from './self-assessment-form/preview-and-send/preview-and-send.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HmrcPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    DataTablesModule,
    PipesModule
  ],
  declarations: [
    HmrcPage,
    SelfAssessmentFormComponent,
    SelectLandlordsComponent,
    SelectSearchAllDirective,
    SelectAllPlusSearchComponent,
    SelectDatesComponent,
    PreviewAndSendComponent
  ],
  entryComponents: [SelectAllPlusSearchComponent]
})
export class HmrcPageModule { }
