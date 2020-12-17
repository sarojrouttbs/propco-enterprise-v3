import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';

import { NotesModalPageModule } from '../../shared/modals/notes-modal/notes-modal.module';
import { EscalateModalPageModule } from '../../shared/modals/escalate-modal/escalate-modal.module';
import { DataTablesModule } from 'angular-datatables';
import { IonicSelectableModule } from 'ionic-selectable';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    NotesModalPageModule,
    EscalateModalPageModule,
    DataTablesModule,
    ReactiveFormsModule,
    IonicSelectableModule
    ],
  declarations: [DashboardPage]
})
export class DashboardPageModule {}
