import { NgModule } from '@angular/core';
import { NoPreloading, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
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
    path: 'solr',
    loadChildren: () => import('./solr/solr.module').then( m => m.SolrPageModule)
  },
  {
    path: 'barclaycard',
    loadChildren: () => import('./barclaycard/barclaycard.module').then( m => m.BarclaycardPageModule)
  },
  {
    path: 'worldpay',
    loadChildren: () => import('./worldpay/worldpay.module').then( m => m.WorldpayPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'agent',
    loadChildren: () => import('./agent/agent.module').then( m => m.AgentPageModule)
  },
  {
    path: 'market-appraisal',
    loadChildren: () => import('./market-appraisal/market-appraisal.module').then( m => m.MarketAppraisalPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
