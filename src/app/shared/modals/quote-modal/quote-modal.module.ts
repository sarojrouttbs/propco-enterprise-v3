import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { FaultsService } from 'src/app/faults/faults.service';
import { QuoteModalPage } from './quote-modal.page';

const routes: Routes = [
  {
    path: '',
    component: QuoteModalPage
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
  declarations: [QuoteModalPage],
  providers: [DatePipe, FaultsService],
  exports: [QuoteModalPage]
})
export class QuoteModalPageModule { }
