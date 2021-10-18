import { MaterialModule } from './../../material.module';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageComponent } from './validation-message/validation-message.component';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { AccordionListComponent } from './accordion-list/accordion-list.component';
import { CloseFaultComponent } from './close-fault/close-fault.component';
import { FaultTitleComponent } from './fault-title/fault-title.component';
import { UseractionformsComponent } from './useractionforms/useractionforms.component';
import { IonicSelectableModule } from 'ionic-selectable';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
    align: "left",
    allowNegative: false,
    decimal: ".",
    precision: 2,
    prefix: "£ ",
    suffix: "",
    thousands: ","
  };
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        MaterialModule,
        IonicSelectableModule,
        CurrencyMaskModule
    ],
    declarations: [ValidationMessageComponent, PropertyDetailsComponent, AccordionListComponent, CloseFaultComponent, FaultTitleComponent, UseractionformsComponent],
    exports: [ValidationMessageComponent, PropertyDetailsComponent, AccordionListComponent, CloseFaultComponent, FaultTitleComponent, UseractionformsComponent],
    providers: [CurrencyPipe, { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }]
})

export class ComponentsModule {

}