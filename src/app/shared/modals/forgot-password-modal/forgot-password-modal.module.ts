import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForgotPasswordModalPageRoutingModule } from './forgot-password-modal-routing.module';

import { ForgotPasswordModalPage } from './forgot-password-modal.page';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ForgotPasswordModalPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ForgotPasswordModalPage]
})
export class ForgotPasswordModalPageModule {}
