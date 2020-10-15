import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NotesModalPage } from './notes-modal.page';

const routes: Routes = [
  {
    path: '',
    component: NotesModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  providers: [DatePipe],
  declarations: [NotesModalPage],
  exports : [NotesModalPage]
})
export class NotesModalPageModule {}
