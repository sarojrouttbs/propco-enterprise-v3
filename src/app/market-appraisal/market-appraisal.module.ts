import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarketAppraisalPageRoutingModule } from './market-appraisal-routing.module';

import { MarketAppraisalPage } from './market-appraisal.page';
import { MaContactComponent } from './ma-contact/ma-contact.component';
import { MaterialModule } from '../material.module';
import { ComponentsModule } from '../shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarketAppraisalPageRoutingModule,
    MaterialModule,
    ComponentsModule
  ],
  declarations: [MarketAppraisalPage, MaContactComponent]
})
export class MarketAppraisalPageModule {}
