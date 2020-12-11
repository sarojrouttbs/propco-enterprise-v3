import { ArrangingContractorComponent } from './arranging-contractor/arranging-contractor.component';
import { SearchPropertyPageModule } from './../../shared/modals/search-property/search-property.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailsPageRoutingModule } from './details-routing.module';

import { DetailsPage } from './details.page';
import { ComponentsModule } from '../../shared/components/components.module';
import { MaterialModule } from '../../material.module';
import { FileDirective } from 'src/app/file.directive';
import { FileDropDirective } from 'src/app/file-drop.directive';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SimplePopoverPageModule } from 'src/app/shared/popover/simple-popover/simple-popover.module';
import { AppoinmentModalPageModule } from 'src/app/shared/modals/appoinment-modal/appoinment-modal.module';
import { QuoteModalPageModule } from 'src/app/shared/modals/quote-modal/quote-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DetailsPageRoutingModule,
    ComponentsModule,
    MaterialModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatCardModule,
    SearchPropertyPageModule,
    SimplePopoverPageModule,
    AppoinmentModalPageModule,
    QuoteModalPageModule
  ],
  declarations: [DetailsPage, FileDirective, FileDropDirective, ArrangingContractorComponent]
})
export class DetailsPageModule { }
