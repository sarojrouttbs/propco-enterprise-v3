import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { interval } from 'rxjs';
import { DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, HMRC_CONFIG, HMRC_ERROR_MESSAGES, HMRC_PREFERENCE_ORDER, PROPCO, SYSTEM_CONFIG } from 'src/app/shared/constants';
import { PreviewPdfModalPage } from '../../hmrc-modals/preview-pdf-modal/preview-pdf-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { BatchDetail } from '../../hmrc-modal';
import { HmrcReportPage } from '../../hmrc-modals/hmrc-report/hmrc-report.page';
import { HmrcService } from '../../hmrc.service';
@Component({
  selector: 'app-progress-summary',
  templateUrl: './progress-summary.component.html',
  styleUrls: ['./progress-summary.component.scss'],
})
export class ProgressSummaryComponent implements OnInit {
  batchCount: any;
  lookupdata: any;
  statementPreferences: any;
  batchList: any;
  NOT_AVAILABLE = DEFAULTS.NOT_AVAILABLE;
  totalSuccess: any;
  totalFinalRecords = 0;
  totalSuccessRecords = 0;
  totalFailureRecords = 0;
  finalCount = 0;
  progressBarColor = 'danger';
  percentage = 0;
  formObj = this.commonService.getItem('HMRC_FILTER', true);
  HMRC_CONFIG = HMRC_CONFIG;
  PDF_CONFIG = {
    baseUrl: null,
    folderName: null,
    finalUrl: null,
    blobUrl: null
  };
  batchDetails: BatchDetail;
  currentDate = new Date();
  DATE_FORMAT = DATE_FORMAT;
  isProcessCompleted = false;
  showPdfBtnLoader = false;
  showCsvBtnLoader = false;
  showSummaryReportBtnLoader = false;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  pdfUrlByFile: any;
  pdfUrlByServer: any;

  constructor(
    private hmrcService: HmrcService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.initApi();
  }

  private async initApi() {
    this.getLookupData();
    await this.getLandlordBatchCount();
    this.startTimer();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data: any) {
    this.statementPreferences = data.statementPreferences;
  }

  getLandlordBatchCount() {
    if (this.commonService.getItem('HMRC_BATCH_COUNT', true)) {
      const response = this.commonService.getItem('HMRC_BATCH_COUNT', true);
      this.getActionItems(response);
    } else {
      const reqObj: any = {
        managementType: this.formObj.selectedManagementType ? this.formObj.selectedManagementType : [],
        propertyOffice: this.formObj.selectedPropertyOfficeCodes ? this.formObj.selectedPropertyOfficeCodes : [],
        selectedPropertyLinkIds: this.formObj.selectedPropertyLinkIds ? this.formObj.selectedPropertyLinkIds : [],
        deselectedPropertyLinkIds: this.formObj.deselectedPropertyLinkIds ? this.formObj.deselectedPropertyLinkIds : [],
        taxHandler: this.formObj.taxHandler
      }
      if (this.formObj.searchText)
        reqObj.searchText = this.formObj.searchText;
      if (this.formObj.searchOnColumns)
        reqObj.searchOnColumns = this.formObj.searchOnColumns;

      return new Promise((resolve) => {
        this.hmrcService.getLandlordBatchCount(reqObj).subscribe((res) => {
          const response = res && res.data ? res.data : '';
          this.commonService.setItem('HMRC_BATCH_COUNT', response);
          this.getActionItems(response);
          resolve(true);
        }, (_error) => {
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.GET_DETAILS_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
          resolve(false);
        });
      });
    }
  }

  private getActionItems(response: any) {
    let statementPref: any = this.statementPreferences;
    statementPref.push({ index: null, value: 'No Preference Available' });
    statementPref.forEach(element => {
      const pref = response.filter(ref => element.index === ref.statementPreference);
      const prefOrder = HMRC_PREFERENCE_ORDER.filter(order => element.index === order.index);
      element.order = prefOrder[0]?.order;
      if (pref.length > 0) {
        element.totalRecords = pref[0].statementPreferenceCount;
        this.totalFinalRecords += pref[0].statementPreferenceCount;
      }
    });
    this.batchList = statementPref.sort(function (a, b) {
      return a.order - b.order;
    });
  }

  private startTimer() {
    const timer = interval(2500).subscribe((sec) => {
      if (this.finalCount != 1)
        this.refreshBatchDetails();

      /* unsubscribe if the process is complete */
      if (this.finalCount === 1) {
        this.getBatchCount();
        this.initPdfDownloadProcess();
        timer.unsubscribe();
        if (!this.commonService.getItem('HRMRC_PROCESS_COMPLETED', true)) {
          this.commonService.setItem('HRMRC_PROCESS_COMPLETED', 'true');
          this.commonService.showMessage('We have successfully generated SA form for ' + this.totalSuccessRecords + ' records & saved the records in DMS.', 'Progress Summary', 'success');
        }
        this.isProcessCompleted = true;
      }
    });
  }

  private async refreshBatchDetails() {
    await this.getBatchCount();
    const existingBatchDetails = await this.getBatchDetails() as BatchDetail;
    this.batchDetails = existingBatchDetails;
    if (existingBatchDetails && existingBatchDetails.isCompleted && this.percentage === 100)
      this.finalCount = 1;
  }

  getBatchCount() {
    const params = new HttpParams().set('hideLoader', true);
    return new Promise((resolve) => {
      this.hmrcService.getBatchCount(this.formObj.batchId, params).subscribe((res) => {
        const response = res && res.data ? res.data : '';
        this.totalSuccessRecords = 0;
        this.totalFailureRecords = 0;
        if (response) {
          this.batchList.forEach(element => {
            const pref = response.filter(ref => element.index === ref.statementPreference);
            if (pref.length > 0) {
              element.totalSuccess = (pref[0].successCount ? pref[0].successCount : 0);
              element.totalFailure = (pref[0].failureCount ? pref[0].failureCount : 0);
              this.totalSuccessRecords += element.totalSuccess;
              this.totalFailureRecords += element.totalFailure;
            }
            if (this.totalFinalRecords > 0)
              this.finalCount = (this.totalSuccessRecords + this.totalFailureRecords) / this.totalFinalRecords;
            this.percentage = Math.round(this.finalCount * 100);
            if (this.finalCount >= 0.33 && this.finalCount < 0.66)
              this.progressBarColor = 'warning';
            if (this.finalCount >= 0.66)
              this.progressBarColor = 'success';
          });
        }
        resolve(true);
      }, (_error) => {
        this.commonService.showMessage(HMRC_ERROR_MESSAGES.GET_DETAILS_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
        this.finalCount = 1;
        resolve(false);
      });
    });
  }

  private async initPdfDownloadProcess() {
    this.showPdfBtnLoader = true;
    this.batchDetails = await this.getBatchDetails() as BatchDetail;
    if (this.batchDetails && this.batchDetails.printFilePath) {
      this.PDF_CONFIG.baseUrl = await this.getSystemConfig(SYSTEM_CONFIG.HMRC_BATCH_PRINT_BASE_URL);
      this.PDF_CONFIG.folderName = await this.getSystemConfig(SYSTEM_CONFIG.HMRC_BATCH_PRINT_FOLDER);
      this.createPdfUrl();
    } else {
      this.showPdfBtnLoader = false;
    }
  }

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
        modalHeader: `HMRC Tax Return Print_${this.commonService.getFormatedDate(this.currentDate, this.DATE_FORMAT.DATE)}`,
        pdfUrl: this.PDF_CONFIG.finalUrl
      },
      backdropDismiss: false
    });

    modal.onDidDismiss();
    await modal.present();
  }

  private getBatchDetails() {
    const batchId = this.formObj.batchId;
    return new Promise((resolve) => {
      this.hmrcService.getHmrcBatchDetails(batchId).subscribe(
        (res) => {
          resolve(res ? res : null);
        },
        (_error) => {
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.GET_DETAILS_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
          resolve(null);
        }
      );
    });
  }

  private async createPdfUrl() {
    if (this.PDF_CONFIG.baseUrl && this.PDF_CONFIG.folderName && this.batchDetails) {
      this.PDF_CONFIG.finalUrl = this.PDF_CONFIG.baseUrl + this.PDF_CONFIG.folderName + '/' + this.batchDetails.printFilePath;
      this.showPdfBtnLoader = false;
      // const pdfBlob = await this.getPdfBlob() as Blob;
      // if (pdfBlob) {
      //   const newBlob = new Blob([pdfBlob], { type: 'application/pdf' });
      //   const blobUrl = window.URL.createObjectURL(newBlob);
      //   this.PDF_CONFIG.blobUrl = blobUrl;
      //   this.showPdfBtnLoader = false;
      // }
    } else {
      this.showPdfBtnLoader = false;
    }
  }

  private getPdfBlob() {
    return new Promise((resolve) => {
      this.hmrcService.downloadPdf({ url: this.PDF_CONFIG.finalUrl }).subscribe((res) => {
        resolve(res ? res : null)
      }, (_error) => {
        this.commonService.showMessage(HMRC_ERROR_MESSAGES.DOWNLOAD_FORM_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
        resolve(null);
      })
    });
  }

  private getSystemConfig(config: string) {
    const params = new HttpParams().set('key', config);
    return new Promise((resolve) => {
      this.hmrcService.getSysconfig(params).subscribe((res) => {
        resolve(res ? res[config] : null);
      });
    });
  }

  async getCsv() {
    const date = new Date();
    const params = new HttpParams().set('hideLoader', true);
    this.showCsvBtnLoader = true;
    const batchId = this.formObj.batchId;
    return new Promise((resolve) => {
      this.hmrcService.getCsv(batchId, params).subscribe(
        (res) => {
          this.showCsvBtnLoader = false;
          if (res)
            this.commonService.downloadDocument(res, 'Billing file (' + this.commonService.getFormatedDate(date, DATE_FORMAT.DATE) + ')', 'text/csv');
          else
            this.commonService.showAlert('Download CSV for billing', DEFAULT_MESSAGES.NO_DATA_AVAILABLE);
          resolve(true);
        },
        (_error) => {
          this.showCsvBtnLoader = false;
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.DOWNLOAD_BILLING_CSV_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
          resolve(false);
        }
      );
    });
  }

  async getSummaryReportCsv() {
    const params = new HttpParams().set('hideLoader', true);
    this.showSummaryReportBtnLoader = true;
    const batchId = this.formObj.batchId;
    return new Promise((resolve) => {
      this.hmrcService.getSummaryReportCsv(batchId, params).subscribe(
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

  async openHmrcReportModal() {
    if (!this.batchDetails)
      await this.initPdfDownloadProcess();
    const modal = await this.modalController.create({
      component: HmrcReportPage,
      cssClass: 'modal-container hmrc-report-modal',
      componentProps: {
        batchId: this.formObj.batchId,
        baseUrl: this.PDF_CONFIG.baseUrl,
        folderName: this.PDF_CONFIG.folderName,
        batchDetails: this.batchDetails,
        finalUrl: this.PDF_CONFIG.finalUrl
      },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async res => {
      if (res.data && res.data === 'success') {
        this.router.navigate(['../self-assessment-form'], { replaceUrl: true, relativeTo: this.route });
      }
    });
    await modal.present();
  }
}
