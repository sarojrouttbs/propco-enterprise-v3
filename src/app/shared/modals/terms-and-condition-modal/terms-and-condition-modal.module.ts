import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TermsAndConditionModalPageRoutingModule } from './terms-and-condition-modal-routing.module';

import { TermsAndConditionModalPage } from './terms-and-condition-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsAndConditionModalPageRoutingModule
  ],
  declarations: [TermsAndConditionModalPage]
})
export class TermsAndConditionModalPageModule {}
