import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HmrcReportPage } from './hmrc-report.page';
import { Routes, RouterModule } from '@angular/router';
import { HmrcService } from 'src/app/hmrc/hmrc.service';
import { PreviewPdfModalPageModule } from 'src/app/shared/modals/preview-pdf-modal/preview-pdf-modal.module';

const routes: Routes = [
  {
    path: '',
    component: HmrcReportPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PreviewPdfModalPageModule
  ],
  declarations: [HmrcReportPage],
  providers: [HmrcService],
  exports: [HmrcReportPage],
})
export class HmrcReportPageModule { }
