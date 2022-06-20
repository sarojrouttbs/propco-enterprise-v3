import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CreateKeySetPage } from './create-key-set.page';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from '../../components/components.module';
import { AgentService } from 'src/app/agent/agent.service';

const routes: Routes = [
  {
    path: '',
    component: CreateKeySetPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MaterialModule,
    ComponentsModule
  ],
  providers: [AgentService],
  declarations: [CreateKeySetPage],
  exports: [CreateKeySetPage]
})
export class CreateKeySetPageModule { }
