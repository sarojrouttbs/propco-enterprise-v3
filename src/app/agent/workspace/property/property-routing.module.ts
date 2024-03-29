import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TenancyComponent } from './admin/tenancy/tenancy.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DetailsComponent } from './details/details.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { PeriodicVisitComponent } from './periodic-visit/periodic-visit.component';
import { MarketingActivityComponent } from './marketing-activity/marketing-activity.component';
import { PropertyPage } from './property.page';
import { RentComponent } from './rent/rent.component';
import { NotesComponent } from './admin/notes/notes.component';
import { ParticularsComponent } from './particulars/particulars.component';
import { WhitegoodsComponent } from './whitegoods/whitegoods.component';
import { KeysComponent } from './admin/keys/keys.component';
import { SafetyDeviceComponent } from './safety-device/safety-device.component';
import { ClausesComponent } from './admin/clauses/clauses.component';
import { MediaComponent } from './media/media.component';
import { UserAssignmentsComponent } from './user-assignments/user-assignments.component';

const routes: Routes = [
  {
    path: ':propertyId',
    component: PropertyPage,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'details',
        component: DetailsComponent,
      },
      {
        path: 'tenancy',
        component: TenancyComponent,
      },
      {
        path: 'rent',
        component: RentComponent,
      },
      {
        path: 'periodic-visit',
        component: PeriodicVisitComponent,
      },
      {
        path: 'marketing-activity',
        component: MarketingActivityComponent
      },
      {
        path: 'maintenance',
        component: MaintenanceComponent
      },
      {
        path: 'notes',
        component: NotesComponent,
      },
      {
        path: 'particulars',
        component: ParticularsComponent,
      },
      {
        path: 'whitegoods',
        component: WhitegoodsComponent,
      },
      {
        path: 'keys',
        component: KeysComponent,
      },
      {
        path: 'safety',
        component: SafetyDeviceComponent,
      },
      {
        path: 'clauses',
        component: ClausesComponent,
      },
      {
        path: 'user-assignments',
        component: UserAssignmentsComponent,
      },
      {
        path: 'create-offer',
        loadChildren: () =>
          import('../../../tob/offer-detail/offer-detail.module').then(
            (m) => m.OfferDetailPageModule
          ),
      },
      {
        path: 'offers',
        loadChildren: () =>
          import('../../../tob/offer-list/offer-list.module').then(
            (m) => m.OfferListPageModule
          ),
      },
      {
        path: 'offer/:offerId',
        loadChildren: () =>
          import('../../../tob/offer-detail/offer-detail.module').then(
            (m) => m.OfferDetailPageModule
          ),
      },
      {
        path: 'applications',
        loadChildren: () => import('../../../tob/application-list/application-list.module').then(m => m.ApplicationListPageModule)
      },
      {
        path: 'create-application',
        loadChildren: () => import('../../../tob/application-detail/application-detail.module').then(m => m.ApplicationDetailPageModule)
      },
      {
        path: 'application/:applicationId',
        loadChildren: () => import('../../../tob/application-detail/application-detail.module').then(m => m.ApplicationDetailPageModule)
      },
      {
        path:'media',
        component: MediaComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertyPageRoutingModule { }
