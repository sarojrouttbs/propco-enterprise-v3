import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HmrcService } from 'src/app/hmrc/hmrc.service';
import { DATE_FORMAT, DEFAULT_MESSAGES, HMRC_ERROR_MESSAGES } from 'src/app/shared/constants';
import { PreviewPdfModalPage } from '../preview-pdf-modal/preview-pdf-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-hmrc-report',
  templateUrl: './hmrc-report.page.html',
  styleUrls: ['./hmrc-report.page.scss'],
})
export class HmrcReportPage {

  batchId: string;
  batchDetails: any;
  finalUrl: string;
  billingReport: any;
  summaryReport: any;
  showBillingBtnLoader = false;
  showSummaryReportBtnLoader = false;
  currentDate = new Date();

  constructor(
    private modalController: ModalController,
    private hmrcService: HmrcService,
    private commonService: CommonService
  ) { }

  async previewPdf() {
    if (this.batchDetails && this.batchDetails.printFilePath === null) {
      /* show message to user if there is no success record */
      this.commonService.showAlert('HMRC Progress Summary', 'No success records found');
      return;
    }
    const modal = await this.modalController.create({
      component: PreviewPdfModalPage,
      cssClass: 'modal-container preview-pdf-modal-container',
      componentProps: {
        modalHeader: `HMRC Tax Return Print_${this.commonService.getFormatedDate(this.currentDate, DATE_FORMAT.DATE)}`,
        pdfUrl: this.finalUrl
      },
      backdropDismiss: false
    });

    modal.onDidDismiss();
    await modal.present();
  }

  async getBillingCsv() {
    const date = new Date();
    const params = new HttpParams().set('hideLoader', true);
    this.showBillingBtnLoader = true;
    return new Promise((resolve) => {
      this.hmrcService.getCsv(this.batchId, params).subscribe(
        (res) => {
          this.showBillingBtnLoader = false;
          if (res)
            this.commonService.downloadDocument(res, 'Billing file (' + this.commonService.getFormatedDate(date, DATE_FORMAT.DATE) + ')', 'text/csv');
          else
            this.commonService.showAlert('Download CSV for billing', DEFAULT_MESSAGES.NO_DATA_AVAILABLE);
          resolve(true);
        },
        (_error) => {
          this.showBillingBtnLoader = false;
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.DOWNLOAD_BILLING_CSV_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
          resolve(false);
        }
      );
    });
  }

  async getSummaryReportCsv() {
    const params = new HttpParams().set('hideLoader', true);
    this.showSummaryReportBtnLoader = true;
    return new Promise((resolve) => {
      this.hmrcService.getSummaryReportCsv(this.batchId, params).subscribe(
        (res) => {
          this.showSummaryReportBtnLoader = false;
          if (res)
            this.commonService.downloadDocument(res, 'Download Summary', 'text/csv');
          else
            this.commonService.showAlert('HMRC Download Summary', DEFAULT_MESSAGES.NO_DATA_AVAILABLE);
          resolve(true);
        },
        (_error) => {
          this.showSummaryReportBtnLoader = false;
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.DOWNLOAD_SUMMARY_SHEET_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
          resolve(false);
        }
      );
    });
  }

  redirectToHome() {
    this.commonService.removeItem('HMRC_FILTER');
    this.commonService.removeItem('HRMRC_PROCESS_COMPLETED');
    this.commonService.removeItem('HMRC_BATCH_COUNT');
    this.commonService.showMessage('We have successfully completed the process.', 'Progress Summary', 'success');
    this.modalController.dismiss('success');
  }

  dismiss() {
    this.modalController.dismiss();
  }

}
