import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DetailsComponent } from "./details/details.component";

import { PropertyPage } from "./property.page";

const routes: Routes = [
  {
    path: ":propertyId",
    component: PropertyPage,
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
      },
      {
        path: "details",
        component: DetailsComponent,
      },
      {
        path: "create-offer",
        loadChildren: () =>
          import("../../../tob/offer-detail/offer-detail.module").then(
            (m) => m.OfferDetailPageModule
          ),
      },
      {
        path: "offers",
        loadChildren: () =>
        import("../../../tob/offer-list/offer-list.module").then(
          (m) => m.OfferListPageModule
          ),
      },
      {
        path: "applications",
        loadChildren: () => import('../../../tob/application-list/application-list.module').then( m => m.ApplicationListPageModule)
      },
      {
        path: 'create-application',
        loadChildren: () => import('../../../tob/application-detail/application-detail.module').then( m => m.ApplicationDetailPageModule)
      },
      {
        path: 'application/:applicationId',
        loadChildren: () => import('../../../tob/application-detail/application-detail.module').then( m => m.ApplicationDetailPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertyPageRoutingModule {}
