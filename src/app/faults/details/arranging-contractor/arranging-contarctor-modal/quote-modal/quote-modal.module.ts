import { QuoteService } from './quote.service';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../../../../shared/components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';
import { QuoteModalPage } from './quote-modal.page';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { CURRENCY_MASK_CONFIGURATION } from '../../../../../shared/constants';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = CURRENCY_MASK_CONFIGURATION;

const routes: Routes = [
  {
    path: '',
    component: QuoteModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    CurrencyMaskModule
  ],
  declarations: [QuoteModalPage,],
  providers: [DatePipe, FaultsService,QuoteService, {provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig}],
  exports: [QuoteModalPage]
})
export class QuoteModalPageModule { }
