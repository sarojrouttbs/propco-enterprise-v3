import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolrPageRoutingModule } from './solr-routing.module';

import { SolrPage } from './solr.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SolrPageRoutingModule
  ],
  declarations: [SolrPage]
})
export class SolrPageModule {}
