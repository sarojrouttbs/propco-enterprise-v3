import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChronologicalHistoryPageRoutingModule } from './chronological-history-routing.module';

import { ChronologicalHistoryPage } from './chronological-history.page';
import { DataTablesModule } from 'angular-datatables';
import { ComponentsModule } from '../../../shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChronologicalHistoryPageRoutingModule,
    DataTablesModule,
    FormsModule,
    ComponentsModule
  ],
  declarations: [ChronologicalHistoryPage]
})
export class ChronologicalHistoryPageModule {}
