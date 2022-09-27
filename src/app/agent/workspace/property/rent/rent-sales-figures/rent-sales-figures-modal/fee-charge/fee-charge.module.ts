import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeeChargePageRoutingModule } from './fee-charge-routing.module';

import { FeeChargePage } from './fee-charge.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeeChargePageRoutingModule
  ],
  declarations: [FeeChargePage]
})
export class FeeChargePageModule {}
