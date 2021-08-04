import { MaterialModule } from './../../material.module';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { AccordionListComponent } from './accordion-list/accordion-list.component';
import { CloseFaultComponent } from './close-fault/close-fault.component';
import { FaultTitleComponent } from './fault-title/fault-title.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        MaterialModule,
    ],
    declarations: [ValidationMessageComponent, PropertyDetailsComponent, AccordionListComponent, CloseFaultComponent, FaultTitleComponent],
    exports: [ValidationMessageComponent, PropertyDetailsComponent, AccordionListComponent, CloseFaultComponent, FaultTitleComponent]
})

export class ComponentsModule {

}