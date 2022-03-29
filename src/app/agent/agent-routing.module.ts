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
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadChildren: () => import("./dashboard/dashboard.module").then((m) => m.DashboardPageModule)
      },
      {
        path: "solr/search-results",
        loadChildren: () =>
          import("../solr/search-results/search-results.module").then(
            (m) => m.SearchResultsPageModule
          ),
      },
      {
        path: "entity/property/dashboard",
        loadChildren: () =>
          import("./workspace/workspace.module").then(
            (m) => m.WorkspacePageModule
          ),
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentPageRoutingModule {}
