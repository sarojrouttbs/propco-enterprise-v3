import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LandlordPageRoutingModule } from './landlord-routing.module';

import { LandlordPage } from './landlord.page';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { DataTablesModule } from 'angular-datatables';
import { ContactInfoComponent } from './contact-info/contact-info.component';
import { AgentService } from '../../agent.service';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { CURRENCY_MASK_CONFIGURATION } from 'src/app/shared/constants';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = CURRENCY_MASK_CONFIGURATION;

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialModule,
    ComponentsModule,
    ReactiveFormsModule,
    DataTablesModule,
    CurrencyMaskModule,
    LandlordPageRoutingModule
  ],
  declarations: [
    LandlordPage,
    ContactInfoComponent
  ],
  providers: [
    AgentService,
    CurrencyPipe,
    {
      provide: CURRENCY_MASK_CONFIG,
      useValue: CustomCurrencyMaskConfig
    }
  ]
})
export class LandlordPageModule {}
