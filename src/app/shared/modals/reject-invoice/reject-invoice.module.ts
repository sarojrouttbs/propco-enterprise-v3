import { IonicModule } from '@ionic/angular';
import { RejectInvoiceComponent } from './reject-invoice.component';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [RejectInvoiceComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    IonicModule
  ]
})
export class RejectInvoiceModule { }
