import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MaterialModule } from "../material.module";
import { AuthGuard } from "../shared/authguard";

import { SolrPage } from "./solr.page";

const routes: Routes = [
  {
    path: "",
    component: SolrPage,
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadChildren: () =>
          import("./dashboard/dashboard.module").then(
            (m) => m.DashboardPageModule
          ),
      },
      {
        path: "search-results",
        loadChildren: () =>
          import("./search-results/search-results.module").then(
            (m) => m.SearchResultsPageModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), MaterialModule],
  exports: [RouterModule],
})
export class SolrPageRoutingModule {}
