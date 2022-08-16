import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PAYMENT_CONFIG } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TemplateFormService } from './template-form.service';

declare var Worldpay: any;

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  styleUrls: ['./template-form.component.scss'],
})

export class TemplateFormComponent implements OnInit {

  @ViewChild('paymentForm', { static: false }) paymentForm: ElementRef;
  @ViewChild('paymentErrors', { static: false }) paymentErrors: ElementRef;

  _worldPayInternalData: {
    applicationId?: string,
    startDate?: string,
    expiryDate?: string,
    transactionId?: number,
    propertyId?: string,
    amount?: number,
    entityType?: string
    entityId?: string
  } = {};
  
  @Input()
  set worldPayInternalData(value) {
    this._worldPayInternalData = value;
  }
  
  @Output() successPayment = new EventEmitter<Boolean>();
  clientKey = null;

  processPaymentReqBody: any = {};
  addressForm: FormGroup;
  PAYMENT_CONFIG = PAYMENT_CONFIG;
  PAYMENT_URL: string;

  constructor(private worldpayService: TemplateFormService,
    public commonService: CommonService,
    private fb: FormBuilder) {
    this.loadScript('https://cdn.worldpay.com/v1/worldpay.js');
    this.PAYMENT_URL = this.commonService.getPaymentUrl(PAYMENT_CONFIG);
  }

  ngOnInit() {
    this.initForms();
    this.initPayment();
  }
  
  initPayment() {
    this.getWorldPayClientKey();
  }

  initForms(): void {
    this.addressForm = this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: ['', Validators.required],
      name: ''
    });
  }

  getWorldPayClientKey() {
    this.worldpayService.getWorldpayClientKey().subscribe((res) => {
      this.clientKey = res.clientKey;
      this.loadScript('https://cdn.worldpay.com/v1/worldpay.js', this.makePayment());
    }, error => {
      this.commonService.showMessage('Something went wrong on server, please try again.', 'Payment', 'error');
    });
  }

  payAndProposeTenancy(orderCode) {
    this.commonService.showLoader();
    let reqBody: any = {};
    reqBody.propertyId = this._worldPayInternalData.propertyId;
    reqBody.createdById = '';
    reqBody.transactionId = orderCode;
    reqBody.depositAmountPaid = this._worldPayInternalData.amount;
    reqBody.startDate = this._worldPayInternalData.startDate;
    reqBody.expiryDate = this._worldPayInternalData.expiryDate;
    reqBody.applicationId = this._worldPayInternalData.applicationId;
    this.worldpayService.payAndProposeTenancy(this._worldPayInternalData.propertyId, reqBody).subscribe((res) => {
      this.commonService.hideLoader();
      this.successPayment.emit(true);
    }, error => {
      this.commonService.hideLoader();
      this.commonService.showMessage('Something went wrong on server, please try again.', 'Propose Tenancy', 'error');
    });
  }

  processWorpayPayment(token) {
    this.commonService.showLoader();
    this.processPaymentReqBody.token = token;
    this.processPaymentReqBody.amount = this._worldPayInternalData.amount;
    this.processPaymentReqBody.cardHolderName = this.addressForm.value.name;
    this.processPaymentReqBody.description = 'the holding deposit for property';
    this.processPaymentReqBody.address = {
      addressLine1: this.addressForm.value.addressLine1,
      addressLine2: this.addressForm.value.addressLine2
    };
    this.processPaymentReqBody.entityType = this._worldPayInternalData.entityType;
    this.processPaymentReqBody.entityId = this._worldPayInternalData.entityId;
    this.worldpayService.processWorpayPayment(this.processPaymentReqBody).subscribe((res: any) => {
      this.commonService.hideLoader();
      if (res.status == 'SUCCESS') {
        this.payAndProposeTenancy(res.orderCode);
      } else {
        this.commonService.showMessage('Something went wrong on server, please contact us.', 'Process Payment', 'error');
      }
    }, error => {
      this.commonService.hideLoader();
      this.commonService.showMessage('Something went wrong on server, please try again.', 'Process Payment', 'error');
    });
  }

  makePayment() {
    var form = this.paymentForm.nativeElement;
    var formError = this.paymentErrors.nativeElement;
    Worldpay.useOwnForm({
      'clientKey': this.clientKey,
      'form': form,
      'reusable': false,
      'callback': (status, response) => {
        formError.natinnerHTML = '';
        if (response.error) {
          if (response.error.message) {
            Worldpay.handleError(form, formError, response.error);
          }
        }
        else if (status === 200 && response.token) {
          this.processWorpayPayment(response.token);
        }
      }
    });
  }

  private loadScript(url: string, callbackFunction: (any) = undefined) {
    const node = document.createElement('script');
    node.src = url;
    node.type = 'text/javascript';
    node.onload = callbackFunction;
    document.getElementsByTagName('body')[0].appendChild(node);
  }
}