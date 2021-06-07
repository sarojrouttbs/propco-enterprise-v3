import { ContractorSelectionModule } from './../../shared/modals/contractor-selection/contractor-selection.module';
import { PaymentComponent } from './payment/payment.component';
import { RejectInvoiceModule } from './../../shared/modals/reject-invoice/reject-invoice.module';
import { JobCompletionComponent } from './job-completion/job-completion.component';
import { WorksorderModalPageModule } from './../../shared/modals/worksorder-modal/worksorder-modal.module';
import { RejectionModalPageModule } from './../../shared/modals/rejection-modal/rejection-modal.module';
import { ArrangingContractorComponent } from './arranging-contractor/arranging-contractor.component';
import { SearchPropertyPageModule } from './../../shared/modals/search-property/search-property.module';
import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
import { FaultQualificationComponent } from './fault-qualification/fault-qualification.component';
import { BranchDetailsModalPageModule } from 'src/app/shared/modals/branch-details-modal/branch-details-modal.module';
import { CloseFaultModalPageModule } from 'src/app/shared/modals/close-fault-modal/close-fault-modal.module';
import { TenancyClauseModalPageModule } from 'src/app/shared/modals/tenancy-clause-modal/tenancy-clause-modal.module';
import { PropertyCertificateModalPageModule } from 'src/app/shared/modals/property-certificate-modal/property-certificate-modal.module';
import { MoreInfoModalPageModule } from 'src/app/shared/modals/more-info-modal/more-info-modal.module';
import { JobCompletionModalPageModule } from 'src/app/shared/modals/job-completion-modal/job-completion-modal.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { PaymentRequestModalPageModule } from 'src/app/shared/modals/payment-request-modal/payment-request-modal.module';
import { ContactDetailsModalPageModule } from 'src/app/shared/modals/contact-details-modal/contact-details-modal.module';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: "left",
  allowNegative: false,
  decimal: ".",
  precision: 2,
  prefix: "£ ",
  suffix: "",
  thousands: ","
};
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
    PendingNotificationModalPageModule,
    BranchDetailsModalPageModule,
    CloseFaultModalPageModule,
    TenancyClauseModalPageModule,
    PropertyCertificateModalPageModule,
    WorksorderModalPageModule,
    RejectInvoiceModule,
    MoreInfoModalPageModule,
    JobCompletionModalPageModule,
    CurrencyMaskModule,
    PaymentRequestModalPageModule,
    ContractorSelectionModule,
    ContactDetailsModalPageModule
  ],
  declarations: [DetailsPage, FileDirective, FileDropDirective, ArrangingContractorComponent,
    PaymentReceivedModalComponent, WithoutPrepaymentModalComponent, FaultQualificationComponent, JobCompletionComponent,
    PaymentComponent],
  providers: [CurrencyPipe, { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }]

})
export class DetailsPageModule { }
