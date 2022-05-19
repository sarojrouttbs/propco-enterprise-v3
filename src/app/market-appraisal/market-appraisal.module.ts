import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MarketAppraisalPageRoutingModule } from './market-appraisal-routing.module';
import { MarketAppraisalPage } from './market-appraisal.page';
import { MaContactComponent } from './ma-contact/ma-contact.component';
import { MaterialModule } from '../material.module';
import { ComponentsModule } from '../shared/components/components.module';
import { DisplayAsModalPageModule } from '../shared/modals/display-as-modal/display-as-modal.module';
import { AddressModalPageModule } from '../shared/modals/address-modal/address-modal.module';
import { LandlordSearchComponent } from './landlord-search/landlord-search.component';
import { MaPropertyComponent } from './ma-property/ma-property.component';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { PipesModule } from '../shared/pipes/pipes.module';
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
    IonicModule,
    MaterialModule,
    ComponentsModule,
    ReactiveFormsModule,
    MarketAppraisalPageRoutingModule,
    DisplayAsModalPageModule,
    AddressModalPageModule,
    CurrencyMaskModule,
    PipesModule
  ],
  declarations: [MarketAppraisalPage, MaContactComponent, MaPropertyComponent,LandlordSearchComponent],
  providers: [CurrencyPipe, { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }]
})
export class MarketAppraisalPageModule { }
