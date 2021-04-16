import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { WorksorderModalPage } from './worksorder-modal.page';
import { WorksorderService } from './worksorder.service';
import { ComponentsModule } from '../../components/components.module';
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
    component: WorksorderModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    CurrencyMaskModule
  ],
  declarations: [WorksorderModalPage],
  providers: [WorksorderService, CurrencyPipe, { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }],
})
export class WorksorderModalPageModule { }
