import { ComponentsModule } from 'src/app/shared/components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RejectionModalPageRoutingModule } from './rejection-modal-routing.module';

import { RejectionModalPage } from './rejection-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RejectionModalPageRoutingModule,
    ComponentsModule
  ],
  declarations: [RejectionModalPage]
})
export class RejectionModalPageModule {}
