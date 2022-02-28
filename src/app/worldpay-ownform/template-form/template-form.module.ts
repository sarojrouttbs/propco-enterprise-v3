import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TemplateFormComponent } from './template-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';

@NgModule({
    declarations: [
        TemplateFormComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        MaterialModule,
        ComponentsModule
    ],
    exports: [
        TemplateFormComponent
    ]
})
export class TemplateFormModule { }
