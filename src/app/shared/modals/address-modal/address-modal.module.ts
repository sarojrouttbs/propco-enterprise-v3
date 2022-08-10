import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddressModalPageRoutingModule } from './address-modal-routing.module';
import { AddressModalPage } from './address-modal.page';
import { ComponentsModule } from '../../components/components.module';
import { PostcodeDirectiveModule } from '../../directives/postcode-directive.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddressModalPageRoutingModule,
    ComponentsModule,
    PostcodeDirectiveModule
  ],
  declarations: [AddressModalPage]
})
export class AddressModalPageModule {}
