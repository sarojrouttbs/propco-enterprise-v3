import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ClauseModalPage } from './clause-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

const routes: Routes = [
  {
    path: '',
    component: ClauseModalPage
  }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MaterialModule
  ],
  declarations: [ClauseModalPage]
})
export class ClauseModalPageModule { }
