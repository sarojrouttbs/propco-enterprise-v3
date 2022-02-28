import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';
import { ComponentsModule } from '../shared/components/components.module';
import { ForgotPasswordModalPageModule } from '../shared/modals/forgot-password-modal/forgot-password-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule,
    ComponentsModule,
    ReactiveFormsModule,
    ForgotPasswordModalPageModule
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
