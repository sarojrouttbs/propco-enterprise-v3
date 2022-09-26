import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AppointmentModalPage } from './appointment-modal.page';
import { ComponentsModule } from '../../../../../shared/components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  {
    path: '',
    component: AppointmentModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    MatTooltipModule
  ],
  declarations: [AppointmentModalPage],
  providers: [DatePipe, FaultsService],
  exports : [AppointmentModalPage]
})
export class AppointmentModalPageModule {}
