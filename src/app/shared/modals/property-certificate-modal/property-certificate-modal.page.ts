import { PlatformLocation } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  // propertyCertificateList: any[] = [];
  isWarrantyDetails = false;
  warrantyDetails;

  constructor(private modalController: ModalController, private location: PlatformLocation,
    private router: Router) {
    this.router.events.subscribe((val) => {
      if (val) {
        this.dismiss();
      }
    });
    this.location.onPopState(() => this.dismiss());
  }

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
    };
    this.propertyCertificate.data.forEach((item) => {
      item.isRowChecked = false;
    });
  }

  selectCertificate(certificate, e) {
    certificate.isRowChecked = e.target.checked;
    if (e.target.checked) {
      this.isWarrantyDetails = true;
      this.warrantyDetails = certificate;
      console.log("propertyDetails", this.warrantyDetails);
      
      this.propertyCertificate.data.forEach(
        ele => {
          if (ele.certificateId != certificate.certificateId) {
            ele.isRowChecked = false;
          }
        })
    }else{
      // this.isPropertyDetails = false;
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
