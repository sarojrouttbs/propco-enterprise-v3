import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LetAlliancePageRoutingModule } from './let-alliance-routing.module';

import { LetAlliancePage } from './let-alliance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LetAlliancePageRoutingModule
  ],
  declarations: [LetAlliancePage]
})
export class LetAlliancePageModule {}
