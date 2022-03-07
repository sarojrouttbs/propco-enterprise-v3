import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgentPage } from './agent.page';

const routes: Routes = [
  {
    path: '',
    component: AgentPage,
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadChildren: () => import("./dashboard/dashboard.module").then((m) => m.DashboardPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgentPageRoutingModule {}
