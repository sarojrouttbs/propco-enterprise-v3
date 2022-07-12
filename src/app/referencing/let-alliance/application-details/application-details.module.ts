import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplicationDetailsPageRoutingModule } from './application-details-routing.module';

import { ApplicationDetailsPage } from './application-details.page';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { TenantListModalPageModule } from 'src/app/shared/modals/tenant-list-modal/tenant-list-modal.module';
import { AddressModalPageModule } from 'src/app/shared/modals/address-modal/address-modal.module';
import { SearchPropertyPageModule } from 'src/app/shared/modals/search-property/search-property.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SelectTenantModalPageModule } from 'src/app/shared/modals/select-tenant-modal/select-tenant-modal.module';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  decimal: ".",
  precision: 2,
  prefix: "£ ",
  suffix: "",
  thousands: ","
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ApplicationDetailsPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    TenantListModalPageModule,
    SelectTenantModalPageModule,
    AddressModalPageModule,
    SearchPropertyPageModule,
    CurrencyMaskModule,
    PipesModule
  ],
  declarations: [ApplicationDetailsPage],
  providers: [CurrencyPipe, {provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig}]
})
export class ApplicationDetailsPageModule {}
