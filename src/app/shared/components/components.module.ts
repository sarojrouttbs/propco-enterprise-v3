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
import { TobPropertyDetailsComponent } from './tob-property-details/tob-property-details.component';
import { PipesModule } from '../pipes/pipes.module';
import { AgentHeaderComponent } from './agent-header/agent-header.component';
import { SearchSuggestionComponent } from './search-suggestion/search-suggestion.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SolrHeaderComponent } from './solr-header/solr-header.component';
import { PropertyDashboardComponent } from './property-dashboard/property-dashboard.component';

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
        CurrencyMaskModule,
        PipesModule
    ],
    declarations: [ValidationMessageComponent, PropertyDetailsComponent, AccordionListComponent, CloseFaultComponent, FaultTitleComponent, UseractionformsComponent, TobPropertyDetailsComponent, AgentHeaderComponent,SearchSuggestionComponent,SearchResultsComponent,SolrHeaderComponent,PropertyDashboardComponent],
    exports: [ValidationMessageComponent, PropertyDetailsComponent, AccordionListComponent, CloseFaultComponent, FaultTitleComponent, UseractionformsComponent, TobPropertyDetailsComponent, AgentHeaderComponent,SearchSuggestionComponent,SearchResultsComponent,SolrHeaderComponent,PropertyDashboardComponent],
    providers: [CurrencyPipe, { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }]
})

export class ComponentsModule {

}