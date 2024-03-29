import { ContractorSelectionModule } from './../../shared/modals/contractor-selection/contractor-selection.module';
import { PaymentComponent } from './payment/payment.component';
import { RejectInvoiceModule } from './../../shared/modals/reject-invoice/reject-invoice.module';
import { JobCompletionComponent } from './job-completion/job-completion.component';
import { WorksorderModalPageModule } from './../../shared/modals/worksorder-modal/worksorder-modal.module';
import { RejectionModalPageModule } from './arranging-contractor/arranging-contarctor-modal/rejection-modal/rejection-modal.module';
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
import { AppointmentModalPageModule } from 'src/app/faults/details/arranging-contractor/arranging-contarctor-modal/appointment-modal/appointment-modal.module';
import { QuoteModalPageModule } from 'src/app/faults/details/arranging-contractor/arranging-contarctor-modal/quote-modal/quote-modal.module';
import { IonicSelectableModule } from 'ionic-selectable';
import { PaymentReceivedModalComponent } from './arranging-contractor/arranging-contarctor-modal/payment-received-modal/payment-received-modal.component';
import { WithoutPrepaymentModalComponent } from 'src/app/faults/details/arranging-contractor/arranging-contarctor-modal/without-prepayment-modal/without-prepayment-modal.component';
import { ContractorDetailsModalPageModule } from 'src/app/shared/modals/contractor-details-modal/contractor-details-modal.module';
import { PendingNotificationModalPageModule } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.module';
import { FaultQualificationComponent } from './fault-qualification/fault-qualification.component';
import { BranchDetailsModalPageModule } from './fault-qualification/fault-qualification-modal/branch-details-modal/branch-details-modal.module';
import { CloseFaultModalPageModule } from 'src/app/shared/modals/close-fault-modal/close-fault-modal.module';
import { TenancyClauseModalPageModule } from 'src/app/shared/modals/tenancy-clause-modal/tenancy-clause-modal.module';
import { PropertyCertificateModalPageModule } from 'src/app/shared/modals/property-certificate-modal/property-certificate-modal.module';
import { MoreInfoModalPageModule } from 'src/app/shared/modals/more-info-modal/more-info-modal.module';
import { JobCompletionModalPageModule } from 'src/app/shared/modals/job-completion-modal/job-completion-modal.module';
import { CurrencyMaskConfig, CurrencyMaskModule, CURRENCY_MASK_CONFIG } from 'ng2-currency-mask';
import { PaymentRequestModalPageModule } from 'src/app/shared/modals/payment-request-modal/payment-request-modal.module';
import { LandlordInstructionComponent } from './landlord-instruction/landlord-instruction.component';
import { ContactDetailsModalPageModule } from 'src/app/shared/modals/contact-details-modal/contact-details-modal.module';
import { ChronologicalHistoryPageModule } from 'src/app/shared/modals/chronological-history/chronological-history.module';
import { SnoozeFaultModalPageModule } from './details-modal/snooze-fault-modal/snooze-fault-modal.module';
import { SendEmailModalModule } from 'src/app/shared/modals/send-email-modal/send-email-modal.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CURRENCY_MASK_CONFIGURATION } from 'src/app/shared/constants';

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = CURRENCY_MASK_CONFIGURATION;
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
    ContactDetailsModalPageModule,
    ChronologicalHistoryPageModule,
    SnoozeFaultModalPageModule,
    SendEmailModalModule,
    PipesModule
  ],
  declarations: [DetailsPage, FileDirective, FileDropDirective, ArrangingContractorComponent,
    PaymentReceivedModalComponent, WithoutPrepaymentModalComponent, FaultQualificationComponent, JobCompletionComponent,
    PaymentComponent, LandlordInstructionComponent],
  providers: [CurrencyPipe, { provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }]

})
export class DetailsPageModule { }
