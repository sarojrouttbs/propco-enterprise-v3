import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-preview-pdf-modal',
  templateUrl: './preview-pdf-modal.page.html',
  styleUrls: ['./preview-pdf-modal.page.scss'],
})
export class PreviewPdfModalPage implements OnInit {
  modalHeader: any;
  pdfUrl: any;
  finalPdfUrl: any;
  constructor(private modalController: ModalController, private commonService: CommonService) { }

  ngOnInit() {
    this.finalPdfUrl = this.commonService.sanitizeUrl(this.pdfUrl);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
