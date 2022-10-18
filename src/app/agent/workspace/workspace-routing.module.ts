import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { WorkspacePage } from "./workspace.page";

const routes: Routes = [
  {
    path: "",
    component: WorkspacePage,
    children: [
      {
        path: 'property',
        loadChildren: () => import(`./property/property.module`)
        .then(m => m.PropertyPageModule)
      },
      {
        path: 'landlord',
        loadChildren: () => import(`./landlord/landlord.module`)
        .then(m => m.LandlordPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspacePageRoutingModule {}
