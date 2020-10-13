import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FaultsPageRoutingModule } from './faults-routing.module';

import { FaultsPage } from './faults.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FaultsPageRoutingModule
  ],
  declarations: [FaultsPage]
})
export class FaultsPageModule {}
