import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CloseFaultModalPage } from './close-fault-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';

const routes: Routes = [
  {
    path: '',
    component: CloseFaultModalPage
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
  declarations: [CloseFaultModalPage],
  providers: [FaultsService],
  exports: [CloseFaultModalPage]
})
export class CloseFaultModalPageModule { }
