import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { interval } from 'rxjs';
import { DATE_FORMAT, DEFAULTS, HMRC_CONFIG, PROPCO, SYSTEM_CONFIG } from 'src/app/shared/constants';
import { PreviewPdfModalPage } from 'src/app/shared/modals/preview-pdf-modal/preview-pdf-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { BatchDetail } from '../../hmrc-modal';
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
  failureRecords = 0;
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

  constructor(
    private hmrcService: HmrcService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.startTimer();
    this.getLandlordBatchCount();
    this.getBatchCount();
    this.initPdfDownloadProcess();
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
    const reqObj: any = {
      managementType: this.formObj.managementType ? this.formObj.managementType : [],
      propertyOffice: this.formObj.propertyOffice ? this.formObj.propertyOffice : [],
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
        response.forEach(element => {
          if (element.statementPreference !== null) {
            this.batchList = this.statementPreferences.map((x) => {
              if (x.index == element.statementPreference) {
                x.totalRecords = element.statementPreferenceCount;
                this.totalFinalRecords += element.statementPreferenceCount;
              }
              return x;
            });
          }
        });
        resolve(true);
      });
    });
  }

  private startTimer() {
    const timer = interval(10000).subscribe(() => {
      this.refreshBatchDetails();
      /* unsubscribe if the process is complete */
      if (this.finalCount == 1)
        timer.unsubscribe();
    });
  }

  private async refreshBatchDetails() {
    const existingBatchDetails = await this.getBatchDetails() as BatchDetail;
    this.batchDetails = existingBatchDetails;
    if (existingBatchDetails) {
      await this.getBatchCount();
      if (existingBatchDetails.isCompleted) {
        this.finalCount = 1;
      }
    }
  }

  getBatchCount() {
    const params = new HttpParams().set('hideLoader', true);
    return new Promise((resolve) => {
      this.hmrcService.getBatchCount(this.formObj.batchId, params).subscribe((res) => {
        const response: any = res && res.data ? res.data : '';
        response.forEach(element => {
          if (element.statementPreference !== null) {
            this.batchList = this.statementPreferences.map((x) => {
              if (x.index == element.statementPreference) {
                x.totalSuccess = element.statementPreferenceCount;
                this.totalSuccessRecords += element.statementPreferenceCount;
                // this.totalSuccessRecords += 3;
                // this.failureRecords += 2;
                this.finalCount = (this.totalSuccessRecords + this.failureRecords) / this.totalFinalRecords;
                // this.finalCount = (this.totalSuccessRecords + this.failureRecords) / 1000;
                this.percentage = (this.finalCount * 100);
                if (this.finalCount >= 0.33 && this.finalCount < 0.66)
                  this.progressBarColor = 'warning';
                if (this.finalCount >= 0.66)
                  this.progressBarColor = 'success';
              }
              return x;
            });
          }
        });
        resolve(true);
      });
    });
  }

  redirectToHome() {
    this.router.navigate(['../self-assessment-form'], { replaceUrl: true, relativeTo: this.route });
  }

  private async initPdfDownloadProcess() {
    this.PDF_CONFIG.baseUrl = await this.getSystemConfig(SYSTEM_CONFIG.HMRC_BATCH_PRINT_BASE_URL);
    this.PDF_CONFIG.folderName = await this.getSystemConfig(SYSTEM_CONFIG.HMRC_BATCH_PRINT_FOLDER);
    this.batchDetails = await this.getBatchDetails() as BatchDetail;
    if (this.batchDetails && this.batchDetails.printFilePath) {
      this.createPdfUrl();
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
        pdfUrl: this.PDF_CONFIG.blobUrl
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => { });
    await modal.present();
  }

  private getBatchDetails() {
    const batchId = this.formObj.batchId;
    return new Promise((resolve) => {
      this.hmrcService.getHmrcBatchDetails(batchId).subscribe(
        (res) => {
          resolve(res ? res : null);
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  private async createPdfUrl() {
    if (this.PDF_CONFIG.baseUrl && this.PDF_CONFIG.folderName && this.batchDetails) {
      this.PDF_CONFIG.finalUrl = this.PDF_CONFIG.baseUrl + this.PDF_CONFIG.folderName + '/' + this.batchDetails.printFilePath;
      const pdfBlob = await this.getPdfBlob() as Blob;
      if (pdfBlob) {
        const newBlob = new Blob([pdfBlob], { type: "application/pdf" });
        const blobUrl = window.URL.createObjectURL(newBlob);
        this.PDF_CONFIG.blobUrl = blobUrl;
      }
    }
  }
  private getPdfBlob() {
    return new Promise((resolve) => {
      this.hmrcService.downloadPdf(this.PDF_CONFIG.finalUrl).subscribe((res) => {
        resolve(res ? res : null)
      }, error => {
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
}
