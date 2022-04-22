import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyPageRoutingModule } from './property-routing.module';

import { PropertyPage } from './property.page';
import { MaterialModule } from 'src/app/material.module';
import { ComponentsModule } from 'src/app/shared/components/components.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DetailsComponent } from './details/details.component';
import { PropertyLandlordTenantComponent } from './property-landlord-tenant/property-landlord-tenant.component';
import { ImagePageModule } from 'src/app/shared/modals/image/image.module';
import { RouterModule, Routes } from '@angular/router';
import { GoogleMapComponent } from './google-map/google-map.component';
import { AgmCoreModule } from '@agm/core';
import { DataTablesModule } from 'angular-datatables';
import { LettingsDetailsComponent } from './details/lettings-details/lettings-details.component';
import { LetBoardComponent } from './details/let-board/let-board.component';
import { HistoryComponent } from './details/history/history.component';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { AgmOverlays } from 'agm-overlays';
import { PropertyAddressComponent } from './details/property-address/property-address.component';

const routes: Routes = [
  {
    path: "",
    component: PropertyPage,
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
      },
      {
        path: "details",
        component: DetailsComponent,
      }
    ]
  }
];

@NgModule({
  imports: [
  CommonModule,
    FormsModule,
    IonicModule,
    // PropertyPageRoutingModule,
    MaterialModule,
    ComponentsModule,
    ImagePageModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    DataTablesModule,
    AgmJsMarkerClustererModule,
    AgmOverlays,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDCUgtEwcER2glTnnY9WqdWkKECQKJ_gto',
      language: "en",
      libraries: ['places','geometry']
}),
  ],
  declarations: [GoogleMapComponent,PropertyPage, DashboardComponent, DetailsComponent, PropertyLandlordTenantComponent, LettingsDetailsComponent, LetBoardComponent, HistoryComponent,PropertyAddressComponent],
  // exports:[PropertyPage]
})
export class PropertyPageModule {}
