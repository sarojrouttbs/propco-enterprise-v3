import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OfferListPageRoutingModule } from './offer-list-routing.module';
import { OfferListPage } from './offer-list.page';
import { MaterialModule } from 'src/app/material.module';
import { OfferListService } from './offer-list.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfferListPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  declarations: [OfferListPage],
  providers: [OfferListService],
})
export class OfferListPageModule { }
