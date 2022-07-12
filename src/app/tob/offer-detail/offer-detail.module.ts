import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OfferDetailPageRoutingModule } from './offer-detail-routing.module';
import { OfferDetailPage } from './offer-detail.page';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { MaterialModule } from 'src/app/material.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { NegotiateModalPageModule } from 'src/app/shared/modals/negotiate-modal/negotiate-modal.module';
export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'left',
  allowNegative: false,
  decimal: '.',
  precision: 2,
  prefix: '£ ',
  suffix: '',
  thousands: ','
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfferDetailPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    ReactiveFormsModule,
    PipesModule,
    CurrencyMaskModule,
    NegotiateModalPageModule
  ],
  declarations: [OfferDetailPage],
  providers: [CurrencyPipe, { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }]
})
export class OfferDetailPageModule {}
