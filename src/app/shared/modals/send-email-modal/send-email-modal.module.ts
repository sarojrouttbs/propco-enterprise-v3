import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatTabsModule } from "@angular/material/tabs";
import { RouterModule, Routes } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { NgxEditorModule } from "ngx-editor";
import { FaultsService } from "src/app/faults/faults.service";
import { ComponentsModule } from "../../components/components.module";
import { SendEmailModalPage } from "./send-email-modal.component";
import { SendEmailService } from "./send-email-modal.service";

const routes: Routes = [
  {
    path: '',
    component: SendEmailModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    MatTabsModule,
    NgxEditorModule
  ],
  providers: [FaultsService, SendEmailService],
  declarations: [SendEmailModalPage],
  exports: [SendEmailModalPage]
})

export class SendEmailModalModule { }