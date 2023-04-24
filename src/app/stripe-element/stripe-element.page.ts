import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Appearance, StripeElementsOptions } from '@stripe/stripe-js';
import { StripePaymentElementComponent, StripeService } from 'ngx-stripe';
import { PAYMENT_TYPES } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { environment } from 'src/environments/environment';
import { StripeElementService } from './stripe.service';

@Component({
  selector: 'app-stripe-element',
  templateUrl: './stripe-element.page.html',
  styleUrls: ['./stripe-element.page.scss'],
})
export class StripeElementPage implements OnInit {
  /**Stripe*/
  stripeElementForm: FormGroup;
  paying;
  @ViewChild(StripePaymentElementComponent) paymentElement: StripePaymentElementComponent;
  showStripeElementForm = false;
  stripeElementPaymentDone = false;
  stripeElementConfig: any;
  appearance: Appearance;
  elementsOptions: StripeElementsOptions;
  stripeIntentResponse: any;
  @Input() data: any;
  @Input() paymentConfig: any;
  @Input() defaultPaymentResponseData: any;
  @Output() onCancelStripeElement = new EventEmitter();
  @Output() onSuccessStripeElement = new EventEmitter();
  /**End*/
  constructor(private commonService: CommonService,
    private fb: FormBuilder,
    private stripeService: StripeElementService,
    private stripeCoreService: StripeService) { }

  ngOnInit() {
    this.initStripeElementForm();
    this.initApiCalls();
  }

  private async initApiCalls() {
    this.paymentConfig = await this.getPaymentConfig();
    this.enableStripeElementForm();
  }
  /**Stripe */
  private initStripeElementForm() {
    this.stripeElementForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      line1: ['', [Validators.required]],
      line2: ['', [Validators.required]],
      postal_code: [''],
      city: [''],
      country: [''],
      state: [''],
    });
    this.pathStripeElementForm();
  }

  private pathStripeElementForm(): void {
    this.stripeElementForm.patchValue({
      email: this.data.billingAddress.email,
      name: this.data.billingAddress.name,
      line1: this.data.billingAddress.line1,
      line2: this.data.billingAddress.line2,
      postal_code: this.data.billingAddress.postal_code,
      city: this.data.billingAddress.city,
      state: this.data.billingAddress.county
    });
  }

  get amount() {
    if (
      !this.stripeElementForm.get('amount') ||
      !this.stripeElementForm.get('amount').value
    )
      return 0;
    const amount = this.stripeElementForm.get('amount').value;
    return Number(amount) / 100;
  }

  private initStripElement() {
    return new Promise((resolve, reject) => {
      this.stripeService
        .createPaymentIntent(this.prepareStripeIntentData())
        .subscribe((pi) => {
          this.elementsOptions.clientSecret = pi.client_secret;
          resolve(true);
        }, err => {
          this.onCancelStripeElement.emit({ type: 'server_error', error: err });
          this.commonService.showMessage('Payment', 'Something went wrong.', 'error');
          resolve(false);
        });
    });

  }

  private prepareStripeIntentData() {
    let date = new Date().toLocaleDateString().replace(/\//g, '');
    date = date.slice(0, 5) + date.slice(7);
    return {
      intentData: {
        amount: this.data.intentData.amount, //https://stripe.com/docs/currencies#zero-decimal
        currency: this.paymentConfig.frontEndConfig.stripeIntentOptions.currency,
        payment_method_types: this.paymentConfig.frontEndConfig.stripeIntentOptions.payment_method_types,
        description: this.data.intentData.description,
        metadata: this.data.intentData.metadata
      },
      method: environment.PAYMENT_METHOD,
      env: environment.PAYMENT_PROD ? 'PROD' : 'TEST',
      paymentConfig: this.paymentConfig
    };
  }

  async enableStripeElementForm() {
    this.paying = true;
    const isInitStripeCompleted = await this.initStripElement();
    this.paying = false;
    if (isInitStripeCompleted) {
      this.showStripeElementForm = true;
    }
  }

  collectStripePayment() {
    if (this.paying) return;
    if (this.stripeElementForm.invalid) {
      this.commonService.showMessage('Payment', 'Please fill the required fields.', 'error')
      return;
    }

    this.paying = true;
    this.stripeCoreService
      .confirmPayment({
        elements: this.paymentElement.elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: this.stripeElementForm.get('name').value,
              email: this.stripeElementForm.get('email').value,
              address: {
                line1: this.stripeElementForm.get('line1').value,
                line2: this.stripeElementForm.get('line2').value,
                city: this.stripeElementForm.get('city').value,
                state: this.stripeElementForm.get('state').value,
              },
            },
          },
        },
        redirect: 'if_required',
      })
      .subscribe({
        next: (result) => {
          this.paying = false;
          if (result.error) {
            this.commonService.showMessage(result.error.message, 'Payment Failed', 'error');
          } else if (result.paymentIntent.status === 'succeeded') {
            this.stripeIntentResponse = result.paymentIntent;
            this.onSuccessStripePayment(this.stripeIntentResponse);
          }
        },
        error: (err) => {
          this.paying = false;
          this.commonService.showMessage(err.message || 'Unknown Error', 'Payment Failed', 'error');
        },
      });
  }

  async getPaymentConfig() {
    return new Promise((resolve) => {
      this.appearance = this.paymentConfig.frontEndConfig.appearance as Appearance;
      this.elementsOptions = this.paymentConfig.frontEndConfig.elementOptions as StripeElementsOptions;
      this.stripeCoreService.changeKey(this.paymentConfig.frontEndConfig.publishableKey as string);
      resolve(this.paymentConfig);
    });
  }

  onCancelStripePayment(action: any, error?: any) {
    if (action === 'cancelled') {
      this.commonService.showConfirm('Payment', 'Are you sure, you want to cancel this payment ?', '', 'YES', 'NO').then(response => {
        if (response) {
          this.onCancelStripeElement.emit({ type: action, error: null });
        }
      });
    }
  }

  onSuccessStripePayment(response) {
    this.onSuccessStripeElement.emit(response);
  }
  /**End */

}
