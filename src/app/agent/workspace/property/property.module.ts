import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyPage } from './property.page';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DetailsComponent } from './details/details.component';
import { PropertyLandlordTenantComponent } from './property-landlord-tenant/property-landlord-tenant.component';
import { ImagePageModule } from 'src/app/agent/workspace/property/dashboard/dashboard-modal/image/image.module';
import { DataTablesModule } from 'angular-datatables';
import { LettingsDetailsComponent } from './details/lettings-details/lettings-details.component';
import { LetBoardComponent } from './details/let-board/let-board.component';
import { HistoryComponent } from './details/history/history.component';
import { PropertyChecksComponent } from './details/property-checks/property-checks.component';
import { CallInfoModalPageModule } from 'src/app/agent/workspace/property/property-landlord-tenant/property-landlord-tenant-modal/call-info-modal/call-info-modal.module';
import { PropertyAddressComponent } from './details/property-address/property-address.component';
import { PropertyPageRoutingModule } from './property-routing.module';
import { NegotiateModalPageModule } from 'src/app/shared/modals/negotiate-modal/negotiate-modal.module';
import { AgentService } from '../../agent.service';
import { RentComponent } from './rent/rent.component';
import { TermsOfBusinessComponent } from './rent/terms-of-business/terms-of-business.component';
import { PeriodicVisitComponent } from './periodic-visit/periodic-visit.component';
import { PeriodicVisitModalPageModule } from 'src/app/agent/workspace/property/periodic-visit/periodic-visit-modal/periodic-visit-modal/periodic-visit-modal.module';
import { TenancyComponent } from './admin/tenancy/tenancy.component';
import { TenanciesComponent } from './admin/tenancy/tenancies/tenancies.component';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { MarketingActivityComponent } from './marketing-activity/marketing-activity.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { NotesModalPageModule } from 'src/app/shared/modals/notes-modal/notes-modal.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { RentSalesFiguresComponent } from './rent/rent-sales-figures/rent-sales-figures.component';
import { ChangeNettPageModule } from './rent/rent-sales-figures/rent-sales-figures-modal/change-nett/change-nett.module';
import { ChangeGrossPageModule } from './rent/rent-sales-figures/rent-sales-figures-modal/change-gross/change-gross.module';
import { FeeChargePageModule } from 'src/app/agent/workspace/property/rent/rent-sales-figures/rent-sales-figures-modal/fee-charge/fee-charge.module';
import { NotesComponent } from './admin/notes/notes.component';
import { KeysComponent } from './admin/keys/keys.component';
import { KeyActivityModalPageModule } from './admin/keys/keys-modal/key-activity-modal/key-activity-modal.module';
import { ParticularsComponent } from './particulars/particulars.component';
import { PreferencesComponent } from './particulars/preferences/preferences.component';
import { CreateKeySetPageModule } from './admin/keys/keys-modal/create-key-set/create-key-set.module';
import { WhitegoodsComponent } from './whitegoods/whitegoods.component';
import { SafetyDeviceComponent } from './safety-device/safety-device.component';
import { PercentageDirective } from 'src/app/percentage.directive';
import { OpenStreetMapComponent } from './open-street-map/open-street-map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { AgreementDetailsComponent } from './admin/tenancy/agreement-details/agreement-details.component';
import { AgreementHistoryComponent } from './admin/tenancy/agreement-history/agreement-history.component';
import { ComplianceRecordsComponent } from './compliance-records/compliance-records.component';
import { CURRENCY_MASK_CONFIGURATION } from 'src/app/shared/constants';
import { PostcodeDirectiveModule } from 'src/app/shared/directives/postcode-directive.module';
import { PropertyFeaturesComponent } from './particulars/property-features/property-features.component';
import { PropertyRoomsComponent } from './particulars/property-rooms/property-rooms.component';
import { IonicSelectableModule } from 'ionic-selectable';
import { FurtherDetailsComponent } from './particulars/further-details/further-details.component';
import { ViewingsComponent } from './viewings/viewings.component';
import { GridViewComponent } from './viewings/grid-view/grid-view.component';
import { ListViewComponent } from './viewings/list-view/list-view.component';
import { WebInternetDetailsComponent } from './particulars/web-internet-details/web-internet-details.component';
import { ClausesComponent } from './admin/clauses/clauses.component';
import { MediaComponent } from './media/media.component';
import { PicturesComponent } from './media/pictures/pictures.component';
import { DescriptionShortLetComponent } from './particulars/description-short-let/description-short-let.component';
import { DescriptionComponent } from './particulars/description/description.component';
import { WhitegoodModalPageModule } from './whitegoods/whitegoods-modal/whitegood-modal/whitegood-modal.module';
import { UserAssignmentsComponent } from './user-assignments/user-assignments.component';
import { ClauseModalPageModule } from './admin/clauses/clause-modal/clause-modal/clause-modal.module';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = CURRENCY_MASK_CONFIGURATION;

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    ImagePageModule,
    ReactiveFormsModule,
    DataTablesModule,
    CallInfoModalPageModule,
    NegotiateModalPageModule,
    PeriodicVisitModalPageModule,
    PipesModule,
    NotesModalPageModule,
    CurrencyMaskModule,
    ChangeNettPageModule,
    ChangeGrossPageModule,
    FeeChargePageModule,
    KeyActivityModalPageModule,
    CreateKeySetPageModule,
    LeafletModule,
    PostcodeDirectiveModule,
    IonicSelectableModule,
    WhitegoodModalPageModule,
    ClauseModalPageModule
  ],
  declarations: [
    PropertyPage,
    DashboardComponent,
    DetailsComponent,
    PropertyLandlordTenantComponent,
    LettingsDetailsComponent,
    LetBoardComponent,
    HistoryComponent,
    PropertyChecksComponent,
    PropertyAddressComponent,
    RentComponent,
    TermsOfBusinessComponent,
    PeriodicVisitComponent,
    TenanciesComponent,
    TenancyComponent,
    MarketingActivityComponent,
    MaintenanceComponent,
    RentSalesFiguresComponent,
    NotesComponent,
    KeysComponent,
    ParticularsComponent,
    PreferencesComponent,
    WhitegoodsComponent,
    SafetyDeviceComponent,
    PercentageDirective,
    OpenStreetMapComponent,
    AgreementDetailsComponent,
    AgreementHistoryComponent,
    ComplianceRecordsComponent,
    FurtherDetailsComponent,
    PropertyFeaturesComponent,
    PropertyRoomsComponent,
    ViewingsComponent,
    GridViewComponent,
    ListViewComponent,
    WebInternetDetailsComponent,
    ClausesComponent,
    MediaComponent,
    PicturesComponent,
    DescriptionShortLetComponent,
    DescriptionComponent,
    UserAssignmentsComponent
  ],
  providers: [
    AgentService,
    CurrencyPipe,
    {
      provide: CURRENCY_MASK_CONFIG,
      useValue: CustomCurrencyMaskConfig
    }
  ]
})
export class PropertyPageModule { }
