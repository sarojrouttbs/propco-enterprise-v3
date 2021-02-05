import { CERTIFICATES_CATEGORY } from './../../constants';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-property-certificate-modal',
  templateUrl: './property-certificate-modal.page.html',
  styleUrls: ['./property-certificate-modal.page.scss'],
})
export class PropertyCertificateModalPage implements OnInit {

  propertyCertificate;
  category;
  certificateId;
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  propertyCertificateList: any[] = [];
  showDetails = false;
  warrantyDetails;
  contractDetails;
  CERTIFICATES_CATEGORY = CERTIFICATES_CATEGORY;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.dtOptions = {
      paging: false,
      pagingType: 'full_numbers',
      responsive: true,
      searching: false,
      ordering: false,
      info: false,
      scrollY: 'auto',
      scrollCollapse: false,

      fixedColumns: true,
      select: true
    };
    this.propertyCertificateList = this.propertyCertificate?.data;
    this.propertyCertificateList.forEach((item) => {
      item.isRowChecked = false;
    });
    if (this.certificateId) {
      const certificate = this.propertyCertificate.data.filter(x => x.certificateId === this.certificateId);
      this.selectCertificate(certificate[0], true);
    }
  }

  selectCertificate(certificate, e) {
    certificate.isRowChecked = e;
    if (e) {
      this.propertyCertificate.data.forEach(
        ele => {
          if (ele.certificateId != certificate.certificateId) {
            ele.isRowChecked = false;
          } else {
            if (this.category === CERTIFICATES_CATEGORY[0]) this.warrantyDetails = certificate;
            if (this.category === CERTIFICATES_CATEGORY[1]) this.contractDetails = certificate;
            this.certificateId = this.category === CERTIFICATES_CATEGORY[0] ? this.warrantyDetails.certificateId : this.contractDetails.certificateId;
            this.showDetails = true;
          }
        });
    } else {
      this.showDetails = false;
      this.certificateId = null;
    }
  }

  dismiss() {
    this.modalController.dismiss(this.certificateId);
  }

  submit() {
    this.modalController.dismiss(this.certificateId);
  }
}
