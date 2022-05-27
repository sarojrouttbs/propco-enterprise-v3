import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { TenancyComponent } from './admin/tenancy/tenancy.component';
import { TenanciesComponent } from './admin/tenancy/tenancies/tenancies.component';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { MarketingActivityComponent } from './marketing-activity/marketing-activity.component';

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
    PipesModule
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
    TenanciesComponent,
    TenancyComponent,
    MarketingActivityComponent
  ],
  providers: [AgentService],
})
export class PropertyPageModule { }
