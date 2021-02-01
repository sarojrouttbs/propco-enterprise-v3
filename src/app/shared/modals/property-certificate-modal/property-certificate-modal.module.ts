import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PropertyCertificateModalPage } from './property-certificate-modal.page';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../../components/components.module';
import { DataTablesModule } from 'angular-datatables';

const routes: Routes = [
  {
    path: '',
    component: PropertyCertificateModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    DataTablesModule
  ],
  declarations: [PropertyCertificateModalPage],
  // providers: [FaultsService],
  exports: [PropertyCertificateModalPage]
})
export class PropertyCertificateModalPageModule {}
