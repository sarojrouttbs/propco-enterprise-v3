import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

import { GuarantorDetailsPageRoutingModule } from './guarantor-details-routing.module';

import { GuarantorDetailsPage } from './guarantor-details.page';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  decimal: ".",
  precision: 2,
  prefix: "£ ",
  suffix: "",
  thousands: ","
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    GuarantorDetailsPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    CurrencyMaskModule
  ],
  declarations: [GuarantorDetailsPage],
  providers: [CurrencyPipe, {provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig}]
})
export class GuarantorDetailsPageModule {}
