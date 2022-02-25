import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { DashboardPageRoutingModule } from "./dashboard-routing.module";

import { DashboardPage } from "./dashboard.page";
import { MaterialModule } from "src/app/material.module";
import { SharedModule } from "../shared/shared.module";
import { GuidedTourModule, GuidedTourService } from "ngx-guided-tour";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule,
    GuidedTourModule,
  ],
  declarations: [DashboardPage],
  providers: [GuidedTourService],
})
export class DashboardPageModule {}
