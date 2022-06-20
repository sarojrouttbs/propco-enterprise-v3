import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgentPageRoutingModule } from './agent-routing.module';

import { AgentPage } from './agent.page';
import { ComponentsModule } from '../shared/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgentPageRoutingModule,
    ComponentsModule
  ],
  declarations: [AgentPage]
})
export class AgentPageModule {}
