import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TobPageRoutingModule } from './tob-routing.module';

import { TobPage } from './tob.page';
import { NegotiateModalPageModule } from '../shared/modals/negotiate-modal/negotiate-modal.module';
import { TermsAndConditionModalPageModule } from '../shared/modals/terms-and-condition-modal/terms-and-condition-modal.module';
import { HoldingDepositePaidModalPageModule } from '../shared/modals/holding-deposite-paid-modal/holding-deposite-paid-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TobPageRoutingModule,
    NegotiateModalPageModule,
    TermsAndConditionModalPageModule,
    HoldingDepositePaidModalPageModule
  ],
  declarations: [TobPage]
})
export class TobPageModule {}
