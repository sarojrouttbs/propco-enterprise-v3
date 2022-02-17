import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HoldingDepositePaidModalPageRoutingModule } from './holding-deposite-paid-modal-routing.module';
import { HoldingDepositePaidModalPage } from './holding-deposite-paid-modal.page';
import { ComponentsModule } from '../../components/components.module';
import { MaterialModule } from 'src/app/material.module';
import { HodlingDepositePaidService } from './hodling-deposite-paid.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HoldingDepositePaidModalPageRoutingModule,
    ReactiveFormsModule,
    ComponentsModule,
    MaterialModule
  ],
  declarations: [HoldingDepositePaidModalPage],
  providers: [HodlingDepositePaidService]
})
export class HoldingDepositePaidModalPageModule {}
