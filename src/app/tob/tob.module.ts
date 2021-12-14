import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TobPageRoutingModule } from './tob-routing.module';

import { TobPage } from './tob.page';
import { NegotiateModalPageModule } from '../shared/modals/negotiate-modal/negotiate-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TobPageRoutingModule,
    NegotiateModalPageModule
  ],
  declarations: [TobPage]
})
export class TobPageModule {}
