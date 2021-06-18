import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContactDetailsModalPage } from './contact-details-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
import { MatTabsModule } from '@angular/material/tabs';
import { FaultsService } from 'src/app/faults/faults.service';

const routes: Routes = [
  {
    path: '',
    component: ContactDetailsModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    MatTabsModule
    
  ],
  declarations: [ContactDetailsModalPage],
  providers: [FaultsService],
  exports: [ContactDetailsModalPage]
})
export class ContactDetailsModalPageModule {}
