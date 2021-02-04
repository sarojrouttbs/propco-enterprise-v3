import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BlockManagementModalPageRoutingModule } from './block-management-modal-routing.module';

import { BlockManagementModalPage } from './block-management-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlockManagementModalPageRoutingModule
  ],
  declarations: [BlockManagementModalPage]
})
export class BlockManagementModalPageModule {}
