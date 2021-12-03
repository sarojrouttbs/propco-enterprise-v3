import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OfferDetailPageRoutingModule } from './offer-detail-routing.module';

import { OfferDetailPage } from './offer-detail.page';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { MaterialModule } from 'src/app/material.module';
import { LookupPipe } from 'src/app/shared/pipes/lookup-pipe';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfferDetailPageRoutingModule,  
    MaterialModule,
    ComponentsModule,
    ReactiveFormsModule,
    PipesModule
  ],
  declarations: [OfferDetailPage]
})
export class OfferDetailPageModule {}
