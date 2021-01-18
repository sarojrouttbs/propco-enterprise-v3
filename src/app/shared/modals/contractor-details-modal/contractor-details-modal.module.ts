import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContractorDetailsModalPage } from './contractor-details-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { FaultsService } from 'src/app/faults/faults.service';
import { ComponentsModule } from '../../components/components.module';

const routes: Routes = [
  {
    path: '',
    component: ContractorDetailsModalPage
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
  declarations: [ContractorDetailsModalPage],
  providers: [DatePipe, FaultsService],
  exports: [ContractorDetailsModalPage]
})
export class ContractorDetailsModalPageModule { }
