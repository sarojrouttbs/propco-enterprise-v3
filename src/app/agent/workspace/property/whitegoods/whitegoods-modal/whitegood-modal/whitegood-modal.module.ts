import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WhitegoodModalPage } from './whitegood-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: WhitegoodModalPage
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
  declarations: [WhitegoodModalPage],
  exports: [WhitegoodModalPage]
})
export class WhitegoodModalPageModule { }
