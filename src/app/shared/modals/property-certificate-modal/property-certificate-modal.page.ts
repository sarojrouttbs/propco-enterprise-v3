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
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  propertyCertificateList: any[] = [];
  isWarrantyDetails = false;
  warrantyDetails;

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
  }

  selectCertificate(certificate, e) {
    certificate.isRowChecked = e.target.checked;
    if (e.target.checked) {
      this.isWarrantyDetails = true;
      this.warrantyDetails = certificate;
      this.propertyCertificateList.forEach(
        ele => {
          if (ele.certificateId != certificate.certificateId) {
            ele.isRowChecked = false;
          }
        })
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
