import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'faults',
    loadChildren: () => import('./faults/faults.module').then( m => m.FaultsPageModule)
  },
  {
    path: 'let-alliance',
    loadChildren: () => import('./referencing/let-alliance/let-alliance.module').then( m => m.LetAlliancePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
