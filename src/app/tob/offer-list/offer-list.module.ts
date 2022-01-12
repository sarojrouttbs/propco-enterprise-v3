import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OfferListPageRoutingModule } from './offer-list-routing.module';
import { OfferListPage } from './offer-list.page';
import { MaterialModule } from 'src/app/material.module';
import { LookupPipe } from 'src/app/shared/pipes/lookup-pipe';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfferListPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    PipesModule
  ],
  declarations: [OfferListPage]
})
export class OfferListPageModule { }
