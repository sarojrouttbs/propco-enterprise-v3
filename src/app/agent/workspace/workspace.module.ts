import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkspacePageRoutingModule } from './workspace-routing.module';

import { WorkspacePage } from './workspace.page';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkspacePageRoutingModule,
    MaterialModule,
    ComponentsModule
  ],
  declarations: [WorkspacePage]
})
export class WorkspacePageModule {}
