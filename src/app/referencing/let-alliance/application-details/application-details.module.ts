import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplicationDetailsPageRoutingModule } from './application-details-routing.module';

import { ApplicationDetailsPage } from './application-details.page';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { TenantListModalPageModule } from 'src/app/shared/modals/tenant-list-modal/tenant-list-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ApplicationDetailsPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    TenantListModalPageModule
  ],
  declarations: [ApplicationDetailsPage]
})
export class ApplicationDetailsPageModule {}
