import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SolrPageRoutingModule } from "./solr-routing.module";

import { SolrPage } from "./solr.page";
import { MaterialModule } from "../material.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolrPageRoutingModule,
  ],
  declarations: [SolrPage],
})
export class SolrPageModule {}
