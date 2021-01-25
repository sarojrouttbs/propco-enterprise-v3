import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { PROPCO, REFERENCING } from '../../constants';
import { CommonService } from '../../services/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../services/validation.service';
import { ReferencingService } from 'src/app/referencing/referencing.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-resend-link-modal',
  templateUrl: './resend-link-modal.page.html',
  styleUrls: ['./resend-link-modal.page.scss'],
})
export class ResendLinkModalPage implements OnInit {
  emailList: any[] = [
    { emailId: '0', label: 'Email', selected: true, emailAdress: '' },
    {
      emailId: '1',
      label: 'Alternate Email',
      selected: false,
      emailAdress: '',
    },
    { emailId: '2', label: 'E-Sign Email', selected: false, emailAdress: '' },
    {
      emailId: '3',
      label: 'Have a new email address, type here',
      selected: false,
      emailAdress: '',
    },
  ];

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  isNotesVisible: boolean = false;

  resendReqObj: any = {};

  applicantDetails: any;
  selectedCheckbox = '0';
  newEmailId: any;
  applicationId: any;
  applicantId: any;
  propertyAddress: any;
  it: any;
  isValidEmail = false;
  lookupdata: any;
  referencingLookupdata: any;
  titleTypes: any;
  isValidMail: boolean;
  newEmailAddressForm: FormGroup;
  notesForm: FormGroup;

  lookupNotesCategories: any[] = [];
  lookupNotesType: any[] = [];

  @Input() paramApplicantId: string;
  @Input() paramApplicationId: string;
  @Input() paramPropertyAddress: string;
  @Input() paramIt: string;

  constructor(
    private router: Router,
    private referencingService: ReferencingService,
    private navParams: NavParams,
    private modalController: ModalController,
    private commonService: CommonService,
    private fb: FormBuilder
  ) {
    this.getLookupData();
  }

  ngOnInit() {
    this.dtOptions = {
      paging: false,
      searching: false,
      ordering: false,
      info: false
    };
    this.applicantId = this.navParams.get('paramApplicantId');
    this.applicationId = this.navParams.get('paramApplicationId');
    this.propertyAddress = this.navParams.get('paramPropertyAddress');
    this.it = this.navParams.get('paramIt');
    this.initiateEmailForm();
    this.initiateNotesForm();
    if (this.it === 'G') {
      this.getGuarantorDetails();
    }
    else {
      this.getTenantDetails();
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.referencingLookupdata = this.commonService.getItem(PROPCO.REFERENCING_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe((data) => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.referencingLookupdata) {
      this.setReferencingLookupData(this.referencingLookupdata);
    } else {
      this.referencingService.getLookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe((data) => {
        this.commonService.setItem(PROPCO.REFERENCING_LOOKUP_DATA, data);
        this.referencingLookupdata = data;
        this.setReferencingLookupData(data);
      });
    }
  }

  private setLookupData(data: any): void {
    this.lookupNotesType = data.notesType;
    this.lookupNotesCategories = data.notesCategories;
  }

  private setReferencingLookupData(data: any): void {
    this.titleTypes = data.titleTypes;
  }

  private initiateEmailForm() {
    this.newEmailAddressForm = this.fb.group({
      email: ['', [ValidationService.emailValidator]],
    });
  }

  private initiateNotesForm(): void {
    this.notesForm = this.fb.group({
      notesType: ['', Validators.required],
      notesCategory: ['', Validators.required],
      notesText: ['', Validators.required]
    })
  }

  private getTenantDetails() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getTenantDetails(this.applicantId).subscribe(
        (res) => {
          this.applicantDetails = res ? res : {};
          this.emailList[0].emailAdress = this.applicantDetails?.email;
          this.emailList[1].emailAdress = this.applicantDetails?.alternativeEmail;
          this.emailList[2].emailAdress = this.applicantDetails?.esignatureEmail;
          this.emailList[3].selected = !(this.emailList.some(email => email.emailAdress));
          resolve(this.applicantDetails);
        },
        (error) => {
          console.log(error);
        }
      );
    });
    return promise;
  }

  private getGuarantorDetails() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getGuarantorDetails(this.applicantId).subscribe(
        (res) => {
          this.applicantDetails = res ? res : {};
          this.emailList[0].emailAdress = this.applicantDetails?.email;
          this.emailList[1].emailAdress = this.applicantDetails?.alternativeEmail;
          this.emailList[2].emailAdress = this.applicantDetails?.esignatureEmail;
          this.emailList[3].selected = !(this.emailList.some(email => email.emailAdress));
          resolve(this.applicantDetails);
        },
        (error) => {
          console.log(error);
        }
      );
    });
    return promise;
  }

  disableCheckbox(emailId: any, event: any) {
    if (event.target.checked) {
      this.selectedCheckbox = emailId;
      this.emailList.forEach((ele) => {
        if (ele.emailId == emailId) {
          ele.selected = true;
        } else {
          ele.selected = false;
        }
      });
    } else {
      this.emailList.forEach((ele) => {
        if (ele.emailId == emailId && this.selectedCheckbox) {
          if (emailId == '3') {
            this.newEmailAddressForm.patchValue({ email: '' });
          }
          if (this.selectedCheckbox == emailId) {
            ele.selected = false;
            this.selectedCheckbox = null;
          }
        }
      });
    }
    this.newEmailAddressForm.markAsUntouched();
  }

  hideAndResetNotes() {
    this.isNotesVisible = !this.isNotesVisible;
    if (!this.isNotesVisible) {
      this.notesForm.patchValue({
        notesType: 0,
        notesCategory: 0,
        notesText: '',
      }, { emitEvent: false });
      this.notesForm.markAsUntouched();
    }
  }

  resendLink() {
    if(this.selectedCheckbox == '0' || this.selectedCheckbox == '1' || this.selectedCheckbox == '2'){
      this.emailList.forEach((ele) => {
        if (ele.emailId === this.selectedCheckbox) {
          this.resendReqObj.email = ele.emailAdress;
        }
      });

      if(this.isNotesVisible) {
        if(!this.isNotesFormValid()){
          return;
        }
      }
    }

    else if (this.selectedCheckbox == '3') {
      if(this.newEmailAddressForm.valid){
        this.resendReqObj.email = this.newEmailAddressForm.get('email').value;
        if(this.isNotesVisible) {
          if(!this.isNotesFormValid()){
            return;
          }
        }
      }
      else{
        this.newEmailAddressForm.markAllAsTouched();
        if(this.isNotesVisible) {
          if(!this.isNotesFormValid()){
            return;
          }
        }
        return;
      }
    }

    this.commonService.showLoader();
    this.referencingService.resendLinkToApplicant(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.resendReqObj, this.applicationId)
      .subscribe(
        (res) => {
          this.commonService.hideLoader();
          this.commonService.showMessage('Email is sent to the applicant.', 'Resend Link', 'success');
        },
        (error) => {
          this.commonService.hideLoader();
          console.log(error);
        }
      ); 
    
    this.dismiss();
  }

  isNotesFormValid(): boolean{
    if(this.notesForm.valid){
      this.resendReqObj.noteModel = {};
      this.resendReqObj.noteModel.type = this.notesForm.get('notesType').value ? this.notesForm.get('notesType').value : 0;
      this.resendReqObj.noteModel.category = this.notesForm.get('notesCategory').value ? this.notesForm.get('notesCategory').value : 0;
      this.resendReqObj.noteModel.notes = this.notesForm.get('notesText').value;
      return true;
    }
    else{
      this.notesForm.markAllAsTouched();
      this.commonService.showMessage('Please fill all required fields.', 'Resend Link', 'error');
      return false;
    }
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }
}
