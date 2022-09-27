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
import { SelectDatesComponent } from './self-assessment-form/select-dates/select-dates.component';
import { OfficeFilterModalPageModule } from './hmrc-modals/office-filter-modal/office-filter-modal.module';
import { PreviewAndSendComponent } from './self-assessment-form/preview-and-send/preview-and-send.component';
import { PreviewPdfModalPageModule } from './hmrc-modals/preview-pdf-modal/preview-pdf-modal.module';
import { IonicSelectableModule } from 'ionic-selectable';
import { ProgressSummaryComponent } from './self-assessment-form/progress-summary/progress-summary.component';
import { HmrcReportPageModule } from './hmrc-modals/hmrc-report/hmrc-report.module';
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
    OfficeFilterModalPageModule,
    PreviewPdfModalPageModule,
    IonicSelectableModule,
    HmrcReportPageModule
  ],
  declarations: [
    HmrcPage,
    SelfAssessmentFormComponent,
    SelectLandlordsComponent,
    SelectDatesComponent,
    PreviewAndSendComponent,
    ProgressSummaryComponent
  ],
})
export class HmrcPageModule { }
