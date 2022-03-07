import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { SolrPageRoutingModule } from "./solr-routing.module";

import { SolrPage } from "./solr.page";
import { ShowRemainingCountPipe } from './pipes/show-remaining-count.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolrPageRoutingModule,
  ],
  declarations: [SolrPage, ShowRemainingCountPipe],
})
export class SolrPageModule {}
