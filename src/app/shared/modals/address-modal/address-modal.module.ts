import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddressModalPageRoutingModule } from './address-modal-routing.module';

import { AddressModalPage } from './address-modal.page';
import { ComponentsModule } from '../../components/components.module';
import { PostcodeDirective } from 'src/app/postcode.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddressModalPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AddressModalPage, PostcodeDirective]
})
export class AddressModalPageModule {}
