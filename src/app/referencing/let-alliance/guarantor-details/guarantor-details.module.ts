import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

import { GuarantorDetailsPageRoutingModule } from './guarantor-details-routing.module';

import { GuarantorDetailsPage } from './guarantor-details.page';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CURRENCY_MASK_CONFIGURATION } from 'src/app/shared/constants';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = CURRENCY_MASK_CONFIGURATION;

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    GuarantorDetailsPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    CurrencyMaskModule,
    PipesModule
  ],
  declarations: [GuarantorDetailsPage],
  providers: [CurrencyPipe, {provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig}]
})
export class GuarantorDetailsPageModule {}
