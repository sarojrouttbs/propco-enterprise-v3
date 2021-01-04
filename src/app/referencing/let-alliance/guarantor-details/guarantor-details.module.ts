import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

import { GuarantorDetailsPageRoutingModule } from './guarantor-details-routing.module';

import { GuarantorDetailsPage } from './guarantor-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    GuarantorDetailsPageRoutingModule,
    MaterialModule,
    ComponentsModule
  ],
  declarations: [GuarantorDetailsPage],
  providers: [CurrencyPipe]
})
export class GuarantorDetailsPageModule {}
