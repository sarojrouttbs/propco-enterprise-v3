import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { PropertyDetailsComponent } from './property-details/property-details.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
    ],
    declarations: [ValidationMessageComponent, PropertyDetailsComponent],
    exports: [ValidationMessageComponent, PropertyDetailsComponent]
})

export class ComponentsModule {

}