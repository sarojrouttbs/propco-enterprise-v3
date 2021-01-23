import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { WorksorderModalPage } from './worksorder-modal.page';
import { WorksorderService } from './worksorder.service';
import { ComponentsModule } from '../../components/components.module';


const routes: Routes = [
  {
    path: '',
    component: WorksorderModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ComponentsModule
  ],
  declarations: [WorksorderModalPage],
  providers: [WorksorderService],
})
export class WorksorderModalPageModule {}
