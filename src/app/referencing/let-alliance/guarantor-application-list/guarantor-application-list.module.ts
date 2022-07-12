import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GuarantorApplicationListPageRoutingModule } from './guarantor-application-list-routing.module';

import { GuarantorApplicationListPage } from './guarantor-application-list.page';

import { DataTablesModule } from 'angular-datatables';
import { ResendLinkModalPageModule } from 'src/app/shared/modals/resend-link-modal/resend-link-modal.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DataTablesModule,
    GuarantorApplicationListPageRoutingModule,
    ResendLinkModalPageModule,
    PipesModule
  ],
  declarations: [GuarantorApplicationListPage]
})
export class GuarantorApplicationListPageModule {}
