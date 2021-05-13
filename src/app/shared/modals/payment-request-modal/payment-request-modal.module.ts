import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PaymentRequestModalPage } from './payment-request-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';

const routes: Routes = [
  {
    path: '',
    component: PaymentRequestModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ],
  declarations: [PaymentRequestModalPage],
  providers: [FaultsService],
  exports : [PaymentRequestModalPage]
})
export class PaymentRequestModalPageModule {}
