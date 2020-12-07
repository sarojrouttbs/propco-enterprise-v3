import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AppoinmentModalPage } from './appoinment-modal.page';
import { ComponentsModule } from '../../components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';

const routes: Routes = [
  {
    path: '',
    component: AppoinmentModalPage
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
  declarations: [AppoinmentModalPage],
  providers: [DatePipe, FaultsService],
  exports : [AppoinmentModalPage]
})
export class AppoinmentModalPageModule {}
