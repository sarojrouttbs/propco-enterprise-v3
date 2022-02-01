import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'faults',
    loadChildren: () => import('./faults/faults.module').then( m => m.FaultsPageModule)
  },
  {
    path: 'let-alliance',
    loadChildren: () => import('./referencing/let-alliance/let-alliance.module').then( m => m.LetAlliancePageModule)
  },
  {
    path: 'chronological-history',
    loadChildren: () => import('./shared/modals/chronological-history/chronological-history.module').then( m => m.ChronologicalHistoryPageModule)
  },
  {
    path: 'tob',
    loadChildren: () => import('./tob/tob.module').then( m => m.TobPageModule)
  },
  {
    path: 'barclaycard',
    loadChildren: () => import('./barclaycard/barclaycard.module').then( m => m.BarclaycardPageModule)
  },
  {
    path: 'worldpay',
    loadChildren: () => import('./worldpay/worldpay.module').then( m => m.WorldpayPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
