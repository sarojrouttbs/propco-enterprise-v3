import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { FaultsService } from 'src/app/faults/faults.service';

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
    AddressModalPageModule
  ],
  declarations: [MarketAppraisalPage, MaContactComponent,LandlordSearchComponent],
  providers:[FaultsService]
})
export class MarketAppraisalPageModule { }
