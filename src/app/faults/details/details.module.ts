import { RejectionModalPageModule } from './../../shared/modals/rejection-modal/rejection-modal.module';
import { RejectionModalPage } from './../../shared/modals/rejection-modal/rejection-modal.page';
import { ArrangingContractorComponent } from './arranging-contractor/arranging-contractor.component';
import { SearchPropertyPageModule } from './../../shared/modals/search-property/search-property.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailsPageRoutingModule } from './details-routing.module';

import { DetailsPage } from './details.page';
import { ComponentsModule } from '../../shared/components/components.module';
import { MaterialModule } from '../../material.module';
import { FileDirective } from 'src/app/file.directive';
import { FileDropDirective } from 'src/app/file-drop.directive';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SimplePopoverPageModule } from 'src/app/shared/popover/simple-popover/simple-popover.module';
import { AppointmentModalPageModule } from 'src/app/shared/modals/appointment-modal/appointment-modal.module';
import { QuoteModalPageModule } from 'src/app/shared/modals/quote-modal/quote-modal.module';
import { IonicSelectableModule } from 'ionic-selectable';
import { PaymentReceivedModalComponent } from 'src/app/shared/modals/payment-received-modal/payment-received-modal.component';
import { WithoutPrepaymentModalComponent } from 'src/app/shared/modals/without-prepayment-modal/without-prepayment-modal.component';
import { ContractorDetailsModalPageModule } from 'src/app/shared/modals/contractor-details-modal/contractor-details-modal.module';
import { PendingNotificationModalPageModule } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DetailsPageRoutingModule,
    ComponentsModule,
    MaterialModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatCardModule,
    SearchPropertyPageModule,
    SimplePopoverPageModule,
    AppointmentModalPageModule,
    QuoteModalPageModule,
    RejectionModalPageModule,
    IonicSelectableModule,
    ContractorDetailsModalPageModule,
    PendingNotificationModalPageModule
  ],
  declarations: [DetailsPage, FileDirective, FileDropDirective, ArrangingContractorComponent,
    PaymentReceivedModalComponent, WithoutPrepaymentModalComponent],
})
export class DetailsPageModule { }
