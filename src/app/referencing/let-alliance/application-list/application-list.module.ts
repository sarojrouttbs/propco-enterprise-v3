import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplicationListPageRoutingModule } from './application-list-routing.module';

import { ApplicationListPage } from './application-list.page';
import { DataTablesModule } from 'angular-datatables';
import { ResendLinkModalPageModule } from 'src/app/shared/modals/resend-link-modal/resend-link-modal.module';
import { IonicSelectableModule } from 'ionic-selectable';
import { MaterialModule } from 'src/app/material.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MaterialModule,
    ApplicationListPageRoutingModule,
    DataTablesModule,
    ResendLinkModalPageModule,
    IonicSelectableModule,
    PipesModule
  ],
  declarations: [ApplicationListPage]
})
export class ApplicationListPageModule {}
