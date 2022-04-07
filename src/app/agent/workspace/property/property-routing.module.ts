import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { DetailsComponent } from "./details/details.component";

import { PropertyPage } from "./property.page";

const routes: Routes = [
  {
    path: "",
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
        path: "dashboard2",
        component: DashboardComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertyPageRoutingModule {}
