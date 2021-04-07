import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { JobCompletionModalPage } from './job-completion-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';

const routes: Routes = [
  {
    path: '',
    component: JobCompletionModalPage
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
  declarations: [JobCompletionModalPage],
  providers: [FaultsService],
  exports: [JobCompletionModalPage]
})
export class JobCompletionModalPageModule {}
