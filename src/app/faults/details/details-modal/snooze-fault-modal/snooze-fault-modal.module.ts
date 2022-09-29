import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SnoozeFaultModalPage } from './snooze-fault-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { FaultsService } from 'src/app/faults/faults.service';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { MaterialModule } from 'src/app/material.module';

const routes: Routes = [
  {
    path: '',
    component: SnoozeFaultModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentsModule,
    RouterModule.forChild(routes),
    MaterialModule
  ],
  declarations: [SnoozeFaultModalPage],
  providers: [FaultsService],
  exports : [SnoozeFaultModalPage]
})
export class SnoozeFaultModalPageModule {}
