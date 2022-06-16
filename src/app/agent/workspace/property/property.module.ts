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
import { ImagePageModule } from 'src/app/shared/modals/image/image.module';
import { GoogleMapComponent } from './google-map/google-map.component';
import { AgmCoreModule } from '@agm/core';
import { DataTablesModule } from 'angular-datatables';
import { LettingsDetailsComponent } from './details/lettings-details/lettings-details.component';
import { LetBoardComponent } from './details/let-board/let-board.component';
import { HistoryComponent } from './details/history/history.component';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmOverlays } from 'agm-overlays';
import { PropertyChecksComponent } from './details/property-checks/property-checks.component';
import { CallInfoModalPageModule } from 'src/app/shared/modals/call-info-modal/call-info-modal.module';
import { PropertyAddressComponent } from './details/property-address/property-address.component';
import { PropertyPageRoutingModule } from './property-routing.module';
import { NegotiateModalPageModule } from 'src/app/shared/modals/negotiate-modal/negotiate-modal.module';
import { AgentService } from '../../agent.service';
import { RentComponent } from './rent/rent.component';
import { TermsOfBusinessComponent } from './rent/terms-of-business/terms-of-business.component';
import { PeriodicVisitComponent } from './periodic-visit/periodic-visit.component';
import { PeriodicVisitModalPageModule } from 'src/app/shared/modals/periodic-visit-modal/periodic-visit-modal.module';
import { TenancyComponent } from './admin/tenancy/tenancy.component';
import { TenanciesComponent } from './admin/tenancy/tenancies/tenancies.component';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { MarketingActivityComponent } from './marketing-activity/marketing-activity.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { NotesModalPageModule } from 'src/app/shared/modals/notes-modal/notes-modal.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { RentSalesFiguresComponent } from './rent/rent-sales-figures/rent-sales-figures.component';
import { ChangeNettPageModule } from 'src/app/shared/modals/change-nett/change-nett.module';
import { ChangeGrossPageModule } from 'src/app/shared/modals/change-gross/change-gross.module';
import { FeeChargePageModule } from 'src/app/shared/modals/fee-charge/fee-charge.module';
import { NotesComponent } from './admin/notes/notes.component';
import { KeysComponent } from './admin/keys/keys.component';
import { KeyActivityModalPageModule } from 'src/app/shared/modals/key-activity-modal/key-activity-modal.module';
import { ParticularsComponent } from './particulars/particulars.component';
import { PreferencesComponent } from './particulars/preferences/preferences.component';
import { CreateKeySetPageModule } from 'src/app/shared/modals/create-key-set/create-key-set.module';

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
    IonicModule,
    PropertyPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    ImagePageModule,
    ReactiveFormsModule,
    DataTablesModule,
    AgmJsMarkerClustererModule,
    AgmOverlays,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDCUgtEwcER2glTnnY9WqdWkKECQKJ_gto',
      language: "en",
      libraries: ['places', 'geometry']
    }),
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
    CreateKeySetPageModule
  ],
  declarations: [
    GoogleMapComponent,
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
    PreferencesComponent
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
