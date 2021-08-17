import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChronologicalHistoryPage } from './chronological-history.page';

const routes: Routes = [
  {
    path: '',
    component: ChronologicalHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChronologicalHistoryPageRoutingModule {}
