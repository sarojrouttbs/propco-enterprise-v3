import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SolrPageRoutingModule } from "./solr-routing.module";

import { SolrPage } from "./solr.page";
import { ComponentsModule } from "../shared/components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolrPageRoutingModule,
    ComponentsModule
  ],
  declarations: [SolrPage],
})
export class SolrPageModule {}
