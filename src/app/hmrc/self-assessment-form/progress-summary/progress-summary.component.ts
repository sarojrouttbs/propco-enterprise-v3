import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DATE_FORMAT, HMRC_CONFIG, SYSTEM_CONFIG } from 'src/app/shared/constants';
import { PreviewPdfModalPage } from 'src/app/shared/modals/preview-pdf-modal/preview-pdf-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { HmrcService } from '../../hmrc.service';

@Component({
  selector: 'app-progress-summary',
  templateUrl: './progress-summary.component.html',
  styleUrls: ['./progress-summary.component.scss'],
})
export class ProgressSummaryComponent implements OnInit {
  HMRC_CONFIG = HMRC_CONFIG;
  PDF_CONFIG = {
    baseUrl: null,
    folderName: null,
    finalUrl: null,
    blobUrl: null
  };
  batchDetails: any;
  currentDate = new Date();
  DATE_FORMAT = DATE_FORMAT

  constructor(private hmrcService: HmrcService, private modalController: ModalController, private commonService: CommonService) { }

  ngOnInit() {
    this.initPdfDownloadProcess();
  }

  private async initPdfDownloadProcess() {
    this.PDF_CONFIG.baseUrl = await this.getSystemConfig(SYSTEM_CONFIG.HMRC_BATCH_PRINT_BASE_URL);
    this.PDF_CONFIG.folderName = await this.getSystemConfig(SYSTEM_CONFIG.HMRC_BATCH_PRINT_FOLDER);
    this.batchDetails = await this.getBatchDetails() as any;
    this.createPdfUrl();
  }

  async previewPdf() {
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
    const batchId = 'a3c7b2f7-ce5b-4700-bd56-d6355c1a87dc';
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
