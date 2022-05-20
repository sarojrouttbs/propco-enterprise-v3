import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplicationListPageRoutingModule } from './application-list-routing.module';

import { ApplicationListPage } from './application-list.page';
import { MaterialModule } from 'src/app/material.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { HoldingDepositePaidModalPageModule } from 'src/app/shared/modals/holding-deposite-paid-modal/holding-deposite-paid-modal.module';
import { NegotiateModalPageModule } from 'src/app/shared/modals/negotiate-modal/negotiate-modal.module';
import { TermsAndConditionModalPageModule } from 'src/app/shared/modals/terms-and-condition-modal/terms-and-condition-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplicationListPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    PipesModule,
    HoldingDepositePaidModalPageModule,
    NegotiateModalPageModule,
    TermsAndConditionModalPageModule
  ],
  declarations: [ApplicationListPage]
})
export class ApplicationListPageModule {}
