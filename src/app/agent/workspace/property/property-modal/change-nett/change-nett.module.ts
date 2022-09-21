import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeNettPageRoutingModule } from './change-nett-routing.module';

import { ChangeNettPage } from './change-nett.page';
import { ComponentsModule } from '../../../../../shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeNettPageRoutingModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [ChangeNettPage]
})
export class ChangeNettPageModule {}
