import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SimplePopoverPageRoutingModule } from './simple-popover-routing.module';

import { SimplePopoverPage } from './simple-popover.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SimplePopoverPageRoutingModule
  ],
  declarations: [SimplePopoverPage]
})
export class SimplePopoverPageModule {}
