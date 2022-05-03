import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-useractionforms',
  templateUrl: './useractionforms.component.html',
  styleUrls: ['./useractionforms.component.scss'],
})
export class UseractionformsComponent implements OnInit {
  @Input() faultDetails;
  @Input() actionSelected;
  @Input() userActionForms: FormGroup;
  @Input() llAuthActionForm: FormGroup;
  @Input() hideWOform;
  @Input() isAuthorizationfields;
  @Input() codes: FaultModels.NominalCode[];
  resultsAvailable = false;
  isContractorSearch = false;
  selectedContractor: Observable<FaultModels.IContractorResponse>;
  currentDate = this.commonService.getFormatedDate(new Date());

  constructor(
    private commonService: CommonService,
    private faultsService: FaultsService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.selectedContractor = this.userActionForms
      .get('contractor')
      .valueChanges.pipe(
        debounceTime(1000),
        switchMap((value: string) =>
          value && value.length > 2
            ? this.faultsService.searchContractor(value)
            : new Observable()
        )
      );
  }

  onSearchChange(event: any) {
    this.isContractorSearch = true;
    const searchString = event.target.value;
    this.userActionForms.patchValue({ contractorId: '' });
    if (searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
  }

  contractorSelected(selected: any): void {
    const fullName =
      selected && selected?.fullName ? selected?.fullName + ',' : '';
    this.userActionForms
      .get('contractor')
      .setValue(selected ? fullName + selected?.reference : undefined);
    this.userActionForms
      .get('contractorId')
      .setValue(selected ? selected?.entityId : undefined);
    this.resultsAvailable = false;
    if (this.isContractorSearch) {
      const currentDate = this.commonService.getFormatedDate(new Date());

      if (
        selected?.employerLiabilityExpiryDate === null ||
        selected?.employerLiabilityExpiryDate < currentDate
      ) {
        this.commonService.showAlert(
          'Landlord Instructions',
          `Does not have valid Employer's Liability`
        );
      }

      if (
        selected?.employerLiabilityExpiryDate !== null &&
        selected?.employerLiabilityExpiryDate === currentDate
      ) {
        this.commonService.showAlert(
          'Landlord Instructions',
          `Employer's Liability is expiring today`
        );
      }

      if (
        selected?.supplierLiabilityExpiryDate !== null &&
        selected?.supplierLiabilityExpiryDate === currentDate
      ) {
        this.commonService.showAlert(
          'Landlord Instructions',
          'Supplier liability insurance is expiring today'
        );
      }

      if (!selected?.isAgentContractorApproved) {
        const key = 'contractor';
        this.userActionForms.controls[key].setErrors({
          invalidContractor: true,
          message: 'An Agreement with the Contractor doesn’t exist',
        });
      }

      if (
        selected?.supplierLiabilityExpiryDate === null ||
        selected?.supplierLiabilityExpiryDate < currentDate
      ) {
        const key = 'contractor';
        this.userActionForms.controls[key].setErrors({
          invalidContractor: true,
          message: 'Supplier liability insurance date is not active',
        });
      }
    }
  }

  endLoading() {
    this.commonService.hideLoader();
  }

  startLoading() {
    this.commonService.showLoader();
  }
}
