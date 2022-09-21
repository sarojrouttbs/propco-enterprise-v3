import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangeGrossPageRoutingModule } from './change-gross-routing.module';

import { ChangeGrossPage } from './change-gross.page';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangeGrossPageRoutingModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [ChangeGrossPage]
})
export class ChangeGrossPageModule { }
