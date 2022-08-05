import { CommonService } from './../../services/common.service';
import { CERTIFICATES_CATEGORY, DATE_FORMAT, DEFAULTS } from './../../constants';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
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
  isEditable;
  // dtOptions: any = {};
  // dtTrigger: Subject<any> = new Subject();
  // @ViewChild(DataTableDirective, { static: false })
  // dtElement: DataTableDirective;
  propertyCertificateList: any[] = [];
  propertyCertificateListForm = new FormGroup({
    propertyCertificateList: new FormArray([]),
  });
  showDetails = false;
  warrantyDetails;
  contractDetails;
  CERTIFICATES_CATEGORY = CERTIFICATES_CATEGORY;
  certificateEmail;
  DATE_FORMAT = DATE_FORMAT;
  DEFAULTS = DEFAULTS;

  constructor(
    private modalController: ModalController,
    private commonCervice: CommonService,
    private formBuilder: FormBuilder
  ) {}

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
      item.expired =
        this.commonCervice.getFormatedDate(item.expireDate, this.DATE_FORMAT.YEAR_DATE) >
        this.commonCervice.getFormatedDate(new Date(), this.DATE_FORMAT.YEAR_DATE)
          ? true
          : false;
      this.patchPropCrtList(item);
    });
  }

  private patchPropCrtList(data) {
    const propCrtList = this.propertyCertificateListForm.get(
      'propertyCertificateList'
    ) as FormArray;
    const contGrup = this.formBuilder.group({
      type: data.type,
      notes: data.notes,
      certificateNumber: data.certificateNumber,
      membershipNumber: data.membershipNumber,
      contact: data.contact,
      contactNumber: data.contactNumber,
      contactRef: data.contactRef,
      supplierAddress: data.supplierAddress,
      starRating: data.starRating,
      appliance: data.appliance,
      model: data.model,
      age: data.age,
      serialNumber: data.serialNumber,
      isArchived: data.isArchived,
      startDate: data.startDate,
      expireDate: data.expireDate,
      otherType: data.otherType,
      category: data.category,
      certificateId: data.certificateId,
      checked: this.certificateId === data.certificateId ? true : false,
      expired: data.expired,
    });
    propCrtList.push(contGrup);
    if (this.certificateId === data.certificateId) {
      this.setDetails(contGrup.value);
      this.showDetails = true;
    }
  }

  selectCertificate(certificate, i) {
    const contlistArray = this.propertyCertificateListForm.get(
      'propertyCertificateList'
    ) as FormArray;
    if (!certificate.checked) {
      contlistArray.controls.forEach((element, index) => {
        if (i != index) {
          element.get('checked').setValue(false);
        } else {
          this.setDetails(certificate);
          this.showDetails = true;
        }
      });
    } else {
      this.showDetails = false;
      this.certificateId = null;
      this.certificateEmail = null;
    }
  }

  private setDetails(certificate) {
    certificate.typeName = this.getCertificateTypeName(certificate.type);
    if (this.category === CERTIFICATES_CATEGORY[0])
      this.warrantyDetails = certificate;
    if (this.category === CERTIFICATES_CATEGORY[1])
      this.contractDetails = certificate;
    this.certificateId =
      this.category === CERTIFICATES_CATEGORY[0]
        ? this.warrantyDetails.certificateId
        : this.contractDetails.certificateId;
    this.certificateEmail =
      this.category === CERTIFICATES_CATEGORY[0]
        ? this.warrantyDetails.contact
        : this.contractDetails.contact;
  }

  private getCertificateTypeName(id) {
    if (!id || !this.certificateTypes) return;
    const name = this.certificateTypes.filter((type) => type.index === id);
    if (Array.isArray(name)) {
      return name[0].value;
    }
  }

  dismiss() {
    let obj = {
      certificateEmail: this.certificateEmail,
      certificateId: this.certificateId,
    };
    this.modalController.dismiss(obj);
  }

  submit() {
    this.modalController.dismiss(this.certificateId);
  }
}
