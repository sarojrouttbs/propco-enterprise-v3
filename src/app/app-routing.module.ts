import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomPreloadingStrategy } from './custom-preloading-strategy';
import { AuthGuard } from './shared/authguard';
import { LoginGuard } from './shared/guard/login.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'faults',
    loadChildren: () => import('./faults/faults.module').then(m => m.FaultsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'let-alliance',
    loadChildren: () => import('./referencing/let-alliance/let-alliance.module').then(m => m.LetAlliancePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tob',
    loadChildren: () => import('./tob/tob.module').then(m => m.TobPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'solr',
    loadChildren: () => import('./solr/solr.module').then(m => m.SolrPageModule),
    data: { preload: true, delay: 0 },
    canActivate: [AuthGuard]
  },
  {
    path: 'barclaycard',
    loadChildren: () => import('./barclaycard/barclaycard.module').then(m => m.BarclaycardPageModule)
  },
  {
    path: 'worldpay',
    loadChildren: () => import('./worldpay/worldpay.module').then(m => m.WorldpayPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'agent',
    loadChildren: () => import('./agent/agent.module').then(m => m.AgentPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'hmrc',
    loadChildren: () => import('./hmrc/hmrc.module').then(m => m.HmrcPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'sso-failure-page',
    loadChildren: () => import('./sso-failure-page/sso-failure-page.module').then( m => m.SsoFailurePagePageModule)
  },
  {
    path: 'v2/online-payment',
    loadChildren: () => import('./v2/online-payment/online-payment.module').then( m => m.OnlinePaymentPageModule)
  },
  {
    path: 'change-sharer',
    loadChildren: () => import('./change-sharer/change-sharer.module').then( m => m.ChangeSharerPageModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: CustomPreloadingStrategy })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
