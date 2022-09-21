import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BranchDetailsModalPage } from './branch-details-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../../../shared/components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';

const routes: Routes = [
  {
    path: '',
    component: BranchDetailsModalPage
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
  declarations: [BranchDetailsModalPage],
  providers: [FaultsService],
  exports: [BranchDetailsModalPage]
})
export class BranchDetailsModalPageModule { }
