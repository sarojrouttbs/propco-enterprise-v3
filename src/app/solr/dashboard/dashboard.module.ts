import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { DashboardPageRoutingModule } from "./dashboard-routing.module";

import { DashboardPage } from "./dashboard.page";
import { MaterialModule } from "src/app/material.module";
import { SearchSuggestionComponent } from "../shared/search-suggestion/search-suggestion.component";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [DashboardPage],
})
export class DashboardPageModule {}