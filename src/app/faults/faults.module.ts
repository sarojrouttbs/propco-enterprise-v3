import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { FaultsPageRoutingModule } from './faults-routing.module';
import { FaultsPage } from './faults.page';
import { FaultsService } from './faults.service';
import { ComponentsModule } from '../shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FaultsPageRoutingModule,
    ComponentsModule
  ],
  declarations: [FaultsPage],
  providers:[FaultsService]
})
export class FaultsPageModule {}
