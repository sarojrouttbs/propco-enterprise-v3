import { QuoteService } from './../quote-modal/quote.service';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';
import { QuoteModalPage } from './quote-modal.page';
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
