import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PROPCO, STRIPE_ELEMENT_CONFIG } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { SolrService } from 'src/app/solr/solr.service';
import { environment } from 'src/environments/environment';
import { OnlinePaymentService } from './online-payment.service';
import { ServiceProviderConf } from './ServiceProviderInterface';
declare function openScreenAdvance(data: any): any;

@Component({
  selector: 'app-online-payment',
  templateUrl: './online-payment.page.html',
  styleUrls: ['./online-payment.page.scss'],
})
export class OnlinePaymentPage implements OnInit {
  stripeConfigurations = STRIPE_ELEMENT_CONFIG;
  incomingReqParams: any = {};
  serviceProviderConf: ServiceProviderConf;
  showStripeElementForm = false;
  stripeElementPaymentDone = false;
  stripeElementData: any;
  loggedInUserData;
  defaultPaymentResponseData: any;
  stripeIntentResponse: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private onlinePaymentService: OnlinePaymentService,
    private commonService: CommonService,
    private router: Router,
    private solrService: SolrService) {
    var snapshot = activatedRoute.snapshot;
    this.incomingReqParams.paymentServiceProvider = snapshot.queryParams.paymentServiceProvider;
    this.incomingReqParams.paymentProcess = snapshot.queryParams.paymentProcess;
    this.incomingReqParams.amount = snapshot.queryParams.amount;
    this.incomingReqParams.entityId = snapshot.queryParams.entityId;
    this.incomingReqParams.entityType = snapshot.queryParams.entityType;
    this.incomingReqParams.propertyId = snapshot.queryParams.propertyId;
  }

  ngOnInit() {
    this.initSSOAuth();
  }

  async initPage() {
    const conf = await this.initApiCall();
    if (conf) {
      this.prepareStripeElementData();
    }
  }

  private async initSSOAuth() {
    const accessToken = this.commonService.getItem(PROPCO.ACCESS_TOKEN);
    const webKey = this.commonService.getItem(PROPCO.WEB_KEY);
    const userData = this.commonService.getItem(PROPCO.USER_DETAILS, true);
    if (accessToken && webKey && userData) {
      this.loggedInUserData = userData;
      this.initPage();
    }
    const isAuthSuccess = await this.authenticateSso();
    if (isAuthSuccess) {
      this.loggedInUserData = await this.getUserDetailsPvt();
      this.initPage();
    } else {
      this.router.navigate(['/sso-failure-page'], { replaceUrl: true });
    }
  }

  private getUserDetailsPvt() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.commonService.getUserDetailsPvt(params).subscribe(
        (res) => {
          if (res) {
            this.commonService.setItem(PROPCO.USER_DETAILS, res.data[0]);
            resolve(res ? res.data[0] : null);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  private authenticateSso() {
    const snapshot = this.activatedRoute.snapshot;
    const ssoKey = encodeURIComponent(snapshot.queryParams.ssoKey);
    this.commonService.setItem(PROPCO.SSO_URL_ROUTE, this.router.url);
    this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
    return new Promise((resolve, reject) => {
      this.solrService
        .authenticateSsoToken(ssoKey)
        .toPromise()
        .then(
          (response) => {
            this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
            this.commonService.setItem(PROPCO.ACCESS_TOKEN, response.loginId);
            this.commonService.setItem(PROPCO.WEB_KEY, response.webKey);
            resolve(true);
          },
          (err) => {
            resolve(false);
          }
        );
    });
  }

  private prepareStripeElementData() {
    let date = new Date().toLocaleDateString().replace(/\//g, '');
    date = date.slice(0, 5) + date.slice(7);
    this.stripeElementData = {
      intentData: {
        amount: this.serviceProviderConf.paymentDetail.amount * 100, //https://stripe.com/docs/currencies#zero-decimal
        currency: this.stripeConfigurations.frontEndConfig.stripeIntentOptions.currency,
        payment_method_types: this.stripeConfigurations.frontEndConfig.stripeIntentOptions.payment_method_types,
        description: this.serviceProviderConf.paymentDetail?.propertyReference
          + ' - ' + this.serviceProviderConf.paymentDetail?.propertyAddress?.addressLine1
          + ', ' + this.serviceProviderConf.paymentDetail?.propertyAddress?.postcode
          + ` / ${this.serviceProviderConf.paymentDetail?.displayAs}`,
        metadata: {
          propertyId: this.serviceProviderConf.paymentDetail.propertyId,
          entityId: this.serviceProviderConf.paymentDetail.entityId,
          reference: this.serviceProviderConf.paymentDetail.reference,
          paymentProcess: this.serviceProviderConf.paymentProcess,
        }
      },
      method: environment.PAYMENT_METHOD,
      env: environment.PAYMENT_PROD ? 'PROD' : 'TEST',
      billingAddress: {
        name: this.serviceProviderConf?.paymentDetail.displayAs,
        email: this.serviceProviderConf?.paymentDetail.email,
        line1: this.serviceProviderConf?.paymentDetail.propertyAddress.addressLine1,
        line2: this.serviceProviderConf?.paymentDetail.propertyAddress.addressLine2,
        postal_code: this.serviceProviderConf?.paymentDetail.propertyAddress.postcode,
        city: this.serviceProviderConf?.paymentDetail.propertyAddress.town,
        state: this.serviceProviderConf?.paymentDetail.propertyAddress.county
      }
    };
    this.showStripeElementForm = true;
  }

  private preparePaymentConfReq() {
    const params = new HttpParams()
      .set('paymentProcess', this.incomingReqParams.paymentProcess)
      .set('paymentServiceProvider', this.incomingReqParams.paymentServiceProvider)
      .set('amount', this.incomingReqParams.amount)
      .set('entityId', this.incomingReqParams.entityId)
      .set('entityType', this.incomingReqParams.entityType)
      .set('propertyId', this.incomingReqParams.propertyId);
    return params;
  }

  private initApiCall() {
    return new Promise((resolve, reject) => {
      this.onlinePaymentService
        .getServiceProviderPaymentConf(this.incomingReqParams.paymentServiceProvider, this.preparePaymentConfReq())
        .subscribe((res) => {
          this.serviceProviderConf = res;
          this.defaultPaymentResponseData = Object.assign({}, this.serviceProviderConf);
          this.defaultPaymentResponseData.userDetail = {
            userName: this.commonService.getItem('user_details', true).name,
            userId: this.commonService.getItem('user_details', true).userId
          }
          delete this.defaultPaymentResponseData.stripeConfig;
          // this.serviceProviderConf = { "paymentServiceProvider": "STRIPE", "paymentProcess": "FEE_PAYMENT", "stripeConfig": { "publishableKey": "pk_test_51MAbP2IXDb8tSMRBgPquMx4ACRSyQp4LHL7UgDBtDAAHGVsC4RjHoc4ZGh4SgXTu1KO7mxieV2cXyhnNrVw4rE7a00H1qxdhUT", "secretKey": "sk_test_51MAbP2IXDb8tSMRBrz0pfzNZ9XzgrIqquidcnFLUZJ91L8vweaGfoF2U7XookrNHZzBLPBdMupGPc3nsH8fojqDh00BiSo2nIM" }, "paymentDetail": { "amount": 50, "propertyReference": "000000012", "propertyAddress": { "addressLine1": "Middliton", "addressLine2": "Stuplehurst", "addressLine3": "Calyton Way", "county": "Orimlington", "country": "UK", "street": null, "buildingName": "1234", "buildingNumber": "123", "postcode": "WN35 3JA", "latitude": "0.0", "longitude": "0.0", "organisationName": "BNl5BvNrBk=+f.pN!,{Lq9@n;", "plotNumber": null, "locality": "Snointon", "town": "Loicestershrie", "pafReference": "5727592.00" }, "propertyId": "0fc83ed0-0ab7-4314-a7e0-79243d90c863", "entityId": "ac1137a8-71c8-16d3-8171-c82703570183", "entityType": "TENANT", "reference": "000000006", "title": null, "foreName": "Winfrod", "surName": "Likin", "middleName": "Hillen", "salutation": "Dr Likin", "displayAs": "Winfrod Likin" } };
          this.stripeConfigurations.frontEndConfig.publishableKey = this.serviceProviderConf.stripeConfig.publishableKey;
          this.stripeConfigurations.nodeConfig.secret_key = this.serviceProviderConf.stripeConfig.secretKey;
          resolve(true);
        }, err => {
          this.commonService.showMessage('Payment', 'Something went wrong.', 'error');
          resolve(false);
        });
    });
  }

  _handleErrorStripeElement(response: any) {
    if (response.type === 'cancelled') {
      this.onCancelStripePayment();
    } else {
      this.sendResponseToHost('error', response.error);
    }
  }

  _handleSuccessStripeElement(response: any) {
    this.stripeElementPaymentDone = true;
    setTimeout(() => {
      this.stripeIntentResponse = response
      this.sendResponseToHost('success', response);
    }, 1000);
  }

  onCancelStripePayment() {
    this.showStripeElementForm = false;
    this.stripeElementPaymentDone = false;
    this.commonService.showMessage('Sorry, your payment has failed.', 'Payment Failed', 'error');
    this.sendResponseToHost('error', { status: 'cancelled' });
  }

  private sendResponseToHost(type: string, error: any) {
    let tmpRes: any = error || {};
    tmpRes.intentData = this.defaultPaymentResponseData;
    if (type === 'error') {
      openScreenAdvance(JSON.stringify({ requestType: 'OnlinePaymentResponse', requestValue: tmpRes }));
    }
    if (type === 'success') {
      openScreenAdvance(JSON.stringify({ requestType: 'OnlinePaymentResponse', requestValue: tmpRes }));
    }
  }
}
