import { CommonService } from './../../services/common.service';
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
  certificateTypes;
  // dtOptions: any = {};
  // dtTrigger: Subject<any> = new Subject();
  // @ViewChild(DataTableDirective, { static: false })
  // dtElement: DataTableDirective;
  propertyCertificateList: any[] = [];
  showDetails = false;
  warrantyDetails;
  contractDetails;
  CERTIFICATES_CATEGORY = CERTIFICATES_CATEGORY;
  certificateEmail;

  constructor(private modalController: ModalController, private commonCervice: CommonService) { }

  ngOnInit() {
    // this.dtOptions = {
    //   paging: false,
    //   pagingType: 'full_numbers',
    //   responsive: true,
    //   searching: false,
    //   ordering: false,
    //   info: false,
    //   scrollY: 'auto',
    //   scrollCollapse: false,

    //   fixedColumns: true,
    //   select: true
    // };
    this.propertyCertificateList = this.propertyCertificate;
    this.propertyCertificateList.forEach((item) => {
      item.isRowChecked = false;
      item.expired = this.commonCervice.getFormatedDate(item.expireDate, 'yyyy-MM-dd') > this.commonCervice.getFormatedDate(new Date(), 'yyyy-MM-dd') ? true : false;
    });
    if (this.certificateId) {
      const certificate = this.propertyCertificate.filter(x => x.certificateId === this.certificateId);
      this.selectCertificate(certificate[0], true);
    }
  }

  selectCertificate(certificate, e) {
    certificate.isRowChecked = e;
    if (e) {
      this.propertyCertificate.forEach(
        ele => {
          if (ele.certificateId != certificate.certificateId) {
            ele.isRowChecked = false;
          } else {
            certificate.typeName = this.getCertificateTypeName(certificate.type);
            if (this.category === CERTIFICATES_CATEGORY[0]) this.warrantyDetails = certificate;
            if (this.category === CERTIFICATES_CATEGORY[1]) this.contractDetails = certificate;
            this.certificateId = this.category === CERTIFICATES_CATEGORY[0] ? this.warrantyDetails.certificateId : this.contractDetails.certificateId;
            this.certificateEmail = this.category === CERTIFICATES_CATEGORY[0] ? this.warrantyDetails.contact : this.contractDetails.contact;
            this.showDetails = true;
          }
        });
    } else {
      this.showDetails = false;
      this.certificateId = null;
      this.certificateEmail = null;
    }
  }

  private getCertificateTypeName(id) {
    if (!id || !this.certificateTypes) return;
    const name = this.certificateTypes.filter(type => type.index === id);
    if (Array.isArray(name)) {
      return name[0].value;
    }
  }

  dismiss() {
    let obj = {
      certificateEmail: this.certificateEmail,
      certificateId: this.certificateId
    };
    this.modalController.dismiss(obj);
  }

  submit() {
    this.modalController.dismiss(this.certificateId);
  }
}
