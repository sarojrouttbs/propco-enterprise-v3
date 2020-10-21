import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailsPageRoutingModule } from './details-routing.module';

import { DetailsPage } from './details.page';
import { ComponentsModule } from '../../shared/components/components.module';
import {MaterialModule} from '../../material.module';
import { FileDirective } from 'src/app/file.directive';
import { FileDropDirective } from 'src/app/file-drop.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DetailsPageRoutingModule,
    ComponentsModule,
    MaterialModule
  ],
  declarations: [DetailsPage, FileDirective, FileDropDirective]
})
export class DetailsPageModule {}
