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
    AddressModalPageModule,
    SearchPropertyPageModule
  ],
  declarations: [ApplicationDetailsPage],
  providers: [CurrencyPipe]
})
export class ApplicationDetailsPageModule {}
