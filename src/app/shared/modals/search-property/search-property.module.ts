import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchPropertyPageRoutingModule } from './search-property-routing.module';

import { SearchPropertyPage } from './search-property.page';
import { MaterialModule } from 'src/app/material.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchPropertyPageRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule
  ],
  declarations: [SearchPropertyPage]
})
export class SearchPropertyPageModule { }
