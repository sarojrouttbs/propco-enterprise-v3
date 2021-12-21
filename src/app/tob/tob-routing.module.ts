import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/authguard';
import { TobPage } from './tob.page';

const routes: Routes = [
  {
    path: '',
    component: TobPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        // redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: ':propertyId/offers',
        loadChildren: () => import('./offer-list/offer-list.module').then(m => m.OfferListPageModule)
      },
      {
        path: ':propertyId/create-offer',
        loadChildren: () => import('./offer-detail/offer-detail.module').then(m => m.OfferDetailPageModule)
      },
      {
        path: ':offerId/view',
        loadChildren: () => import('./offer-detail/offer-detail.module').then(m => m.OfferDetailPageModule)
      },
      {
        path: ':propertyId/applications',
        loadChildren: () => import('./application-list/application-list.module').then(m => m.ApplicationListPageModule)
      },
      {
        path: ':propertyId/create-application',
        loadChildren: () => import('./application-detail/application-detail.module').then( m => m.ApplicationDetailPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TobPageRoutingModule { }
