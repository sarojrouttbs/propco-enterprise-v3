import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResendLinkModalPageRoutingModule } from './resend-link-modal-routing.module';

import { ResendLinkModalPage } from './resend-link-modal.page';
import { ComponentsModule } from './../../components/components.module';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ResendLinkModalPageRoutingModule,
    ComponentsModule,
    DataTablesModule
  ],
  declarations: [ResendLinkModalPage]
})
export class ResendLinkModalPageModule {}
