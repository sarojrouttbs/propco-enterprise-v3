import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ModalController, NavParams } from "@ionic/angular";
import { PROPCO, REFERENCING } from "../../constants";
import { CommonService } from "../../services/common.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "../../services/validation.service";
import { ReferencingService } from 'src/app/referencing/referencing.service';
import { Subject } from 'rxjs';

@Component({
  selector: "app-resend-link-modal",
  templateUrl: "./resend-link-modal.page.html",
  styleUrls: ["./resend-link-modal.page.scss"],
})
export class ResendLinkModalPage implements OnInit {
  emailList: any[] = [
    { emailId: "0", label: "Email", selected: true, emailAdress: "" },
    {
      emailId: "1",
      label: "Alternate Email",
      selected: false,
      emailAdress: "",
    },
    { emailId: "2", label: "E-Sign Email", selected: false, emailAdress: "" },
    {
      emailId: "3",
      label: "Have a new email address, type here",
      selected: false,
      emailAdress: "",
    },
  ];

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  resendReqObj = {
    email: "",
  };

  tenantDetails: applicationModels.ITenantResponse;
  selectedCheckbox = "0";
  newEmailId;
  applicationId: any;
  applicantId: any;
  propertyAddress: any;
  isValidEmail = false;
  lookupdata: any;
  laLookupdata: any;
  titleTypes: any;
  isValidMail: boolean;
  newEmailAddressForm: FormGroup;

  @Input() paramApplicantId: string;
  @Input() paramApplicationId: string;
  @Input() paramAropertyAddress: string;

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
    this.applicantId = this.navParams.get("paramApplicantId");
    this.applicationId = this.navParams.get("paramApplicationId");
    this.propertyAddress = this.navParams.get('paramAropertyAddress');
    this.initiateEmailForm();
    this.getTenantDetail();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.laLookupdata = this.commonService.getItem(PROPCO.LA_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe((data) => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.laLookupdata) {
      this.setLALookupData(this.lookupdata);
    } else {
      this.referencingService.getLALookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe((data) => {
        this.commonService.setItem(PROPCO.LA_LOOKUP_DATA, data);
        this.laLookupdata = data;
        this.setLALookupData(data);
      });
    }
  }

  private setLookupData(data: any) { }

  private setLALookupData(data: any) {
    this.titleTypes = this.laLookupdata.titleTypes;
  }

  private initiateEmailForm() {
    this.newEmailAddressForm = this.fb.group({
      email: ["", [ValidationService.emailValidator]],
    });
  }

  private getTenantDetail() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getTenantDetails(this.applicantId).subscribe(
        (res) => {
          this.tenantDetails = res ? res : {};
          this.emailList[0].emailAdress = this.tenantDetails?.email;
          this.emailList[1].emailAdress = this.tenantDetails?.alternativeEmail;
          this.emailList[2].emailAdress = this.tenantDetails?.esignatureEmail;
          resolve(this.tenantDetails);
        },
        (error) => {
          console.log(error);
        }
      );
    });
    return promise;
  }

  disableCheckbox(emailId, event) {
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

  resendLink() {
    if (this.selectedCheckbox == "3" && this.newEmailAddressForm.invalid) {
      this.newEmailAddressForm.markAllAsTouched();
      return;
    }
    this.emailList[3].emailAdress = this.newEmailAddressForm?.get('email').value;
    this.emailList.forEach((ele) => {
      if (ele.emailId === this.selectedCheckbox) {
        this.resendReqObj.email = ele.emailAdress;
        this.commonService.showLoader();
        this.referencingService
          .resendLinkToApplicant(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, this.resendReqObj, this.applicationId)
          .subscribe(
            (res) => {
              this.commonService.hideLoader();
              this.commonService.showMessage(
                "Link has been sent successfully.",
                "Resend Link",
                "success"
              );
            },
            (error) => {
              this.commonService.hideLoader();
              this.commonService.showMessage(
                "Something went wrong on server, please try again.",
                "Resend Link",
                "Error"
              );
              console.log(error);
            }
          );
      }
    });
    this.dismiss();
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }
}
