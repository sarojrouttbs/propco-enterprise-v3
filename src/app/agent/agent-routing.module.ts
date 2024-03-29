import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared/authguard';
import { AgentPage } from './agent.page';

const routes: Routes = [
  {
    path: '',
    component: AgentPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardPageModule)
      },
      {
        path: 'solr/search-results',
        loadChildren: () =>
          import('../solr/search-results/search-results.module').then(
            (m) => m.SearchResultsPageModule
          ),
      },
      {
        path: 'workspace',
        loadChildren: () =>
          import('./workspace/workspace.module').then(
            (m) => m.WorkspacePageModule
          ),
      },
      {
        path: 'let-alliance',
        loadChildren: () =>
          import('../referencing/let-alliance/let-alliance.module').then(
            (m) => m.LetAlliancePageModule
          ),
      },
      {
        path: 'maintenance',
        loadChildren: () => import('../faults/faults.module').then(m => m.FaultsPageModule)
      },
      {
        path: 'market-appraisal',
        loadChildren: () => import('../market-appraisal/market-appraisal.module').then(m => m.MarketAppraisalPageModule)
      },
      {
        path: 'hmrc',
        loadChildren: () => import('../hmrc/hmrc.module').then( m => m.HmrcPageModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentPageRoutingModule { }
