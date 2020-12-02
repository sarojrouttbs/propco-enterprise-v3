import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPropertyPageRoutingModule } from './search-property-routing.module';

import { SearchPropertyPage } from './search-property.page';
import { MaterialModule } from 'src/app/material.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchPropertyPageRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [SearchPropertyPage]
})
export class SearchPropertyPageModule { }
