import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchApplicationPageRoutingModule } from './search-application-routing.module';

import { SearchApplicationPage } from './search-application.page';
import { MaterialModule } from 'src/app/material.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialModule,
    ReactiveFormsModule,
    SearchApplicationPageRoutingModule
  ],
  declarations: [SearchApplicationPage]
})
export class SearchApplicationPageModule {}
