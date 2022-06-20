import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplicationListPageRoutingModule } from './application-list-routing.module';

import { ApplicationListPage } from './application-list.page';
import { MaterialModule } from 'src/app/material.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { HoldingDepositePaidModalPageModule } from 'src/app/shared/modals/holding-deposite-paid-modal/holding-deposite-paid-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplicationListPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    PipesModule,
    HoldingDepositePaidModalPageModule
  ],
  declarations: [ApplicationListPage]
})
export class ApplicationListPageModule {}
