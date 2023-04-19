import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OnlinePaymentPageRoutingModule } from './online-payment-routing.module';

import { OnlinePaymentPage } from './online-payment.page';
import { StripeElementPageModule } from 'src/app/stripe-element/stripe-element.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OnlinePaymentPageRoutingModule,
    StripeElementPageModule
  ],
  declarations: [OnlinePaymentPage]
})
export class OnlinePaymentPageModule {}
