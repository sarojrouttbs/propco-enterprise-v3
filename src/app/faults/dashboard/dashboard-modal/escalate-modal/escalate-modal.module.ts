import { ComponentsModule } from 'src/app/shared/components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EscalateModalPageRoutingModule } from './escalate-modal-routing.module';
import { EscalateModalPage } from './escalate-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EscalateModalPageRoutingModule,
    ComponentsModule
  ],
  declarations: [EscalateModalPage],
  exports: [EscalateModalPage]
})
export class EscalateModalPageModule {}
