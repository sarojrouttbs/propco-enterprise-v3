import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ModalController, NavParams } from "@ionic/angular";
import { PROPCO, REFERENCING } from "../../constants";
import { CommonService } from "../../services/common.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ValidationService } from "../../services/validation.service";
import { ReferencingService } from 'src/app/referencing/referencing.service';

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
  newEmailAddress: FormGroup;

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
    this.applicantId = this.navParams.get("applicantId");
    this.applicationId = this.navParams.get("applicationId");
    this.propertyAddress = this.navParams.get('propertyAddress');
    this.initiateEmailForm();
    this.getTenantDetail();
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

  private initiateEmailForm() {
    this.newEmailAddress = this.fb.group({
      email: ["", [ValidationService.emailValidator]],
    });
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
            this.newEmailAddress.patchValue({ email: '' });
          }
          if (this.selectedCheckbox == emailId) {
            ele.selected = false;
            this.selectedCheckbox = null;
          }
        }
      });
    }
    this.newEmailAddress.markAsUntouched();
  }

  resendLink() {
    if (this.selectedCheckbox == "3" && this.newEmailAddress.invalid) {
      this.newEmailAddress.markAllAsTouched();
      return;
    }
    this.emailList[3].emailAdress = this.newEmailAddress?.controls[
      "email"
    ].value;
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
