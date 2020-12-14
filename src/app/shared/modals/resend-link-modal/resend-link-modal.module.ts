import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResendLinkModalPageRoutingModule } from './resend-link-modal-routing.module';

import { ResendLinkModalPage } from './resend-link-modal.page';
import { ComponentsModule } from './../../components/components.module';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ResendLinkModalPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ResendLinkModalPage]
})
export class ResendLinkModalPageModule {}
