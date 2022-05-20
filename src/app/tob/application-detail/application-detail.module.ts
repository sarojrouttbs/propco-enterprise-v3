import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApplicationDetailPageRoutingModule } from './application-detail-routing.module';
import { ApplicationDetailPage } from './application-detail.page';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { MaterialModule } from 'src/app/material.module';
import { TemplateFormModule } from 'src/app/worldpay-ownform/template-form/template-form.module';
import { TermsAndConditionModalPageModule } from 'src/app/shared/modals/terms-and-condition-modal/terms-and-condition-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplicationDetailPageRoutingModule,
    ReactiveFormsModule,
    PipesModule,
    ComponentsModule,
    MaterialModule,
    TemplateFormModule,
    TermsAndConditionModalPageModule
  ],
  declarations: [ApplicationDetailPage]
})
export class ApplicationDetailPageModule {}
