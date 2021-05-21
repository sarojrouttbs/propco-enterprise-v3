import { FaultsService } from './../../../faults/faults.service';
import { ComponentsModule } from './../../components/components.module';
import { ContractorSelectionComponent } from './contractor-selection.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: ContractorSelectionComponent
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
  declarations: [ContractorSelectionComponent],
  providers: [FaultsService],
  exports : [ContractorSelectionComponent]
})
export class ContractorSelectionModule { }
