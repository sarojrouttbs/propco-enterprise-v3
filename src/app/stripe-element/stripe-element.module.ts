import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StripeElementPageRoutingModule } from './stripe-element-routing.module';

// import { StripeElementPage } from './stripe-element.page';
import { NgxStripeModule } from 'ngx-stripe';
import { MaterialModule } from 'src/app/material.module';
import { StripeElementPage } from './stripe-element.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    // StripeElementPageRoutingModule,
    NgxStripeModule,
    MaterialModule,
    NgxStripeModule.forRoot()
  ], exports: [
    StripeElementPage
  ],
  declarations: [StripeElementPage]
})
export class StripeElementPageModule { }
