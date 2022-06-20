import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HmrcPageRoutingModule } from './hmrc-routing.module';

import { HmrcPage } from './hmrc.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HmrcPageRoutingModule
  ],
  declarations: [HmrcPage]
})
export class HmrcPageModule {}
