import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { WorksorderService } from './worksorder.service';
import { FOLDER_NAMES, MAX_QUOTE_LIMIT } from '../../constants';


@Component({
  selector: 'app-worksorder-modal',
  templateUrl: './worksorder-modal.page.html',
  styleUrls: ['./worksorder-modal.page.scss', '../../drag-drop.scss'],
})
export class WorksorderModalPage implements OnInit {
  faultNotificationId;
  faultId;
  maintenanceId;
  actionType;
  jobCompletionForm: FormGroup;
  uploadDocumentForm: FormGroup;
  uploadPhotoForm: FormGroup;
  uploadedInvoice = [];
  uploadedPhoto = [];
  type: string = 'invoice';
  showLoader: boolean = null;
  jobCompletionDate;
  isAnyFurtherWork;
  additionalEstimate;
  additionalWorkDetails;
  private QUOTE_LIMIT;
  confirmedEstimate;
  isLimitExceed = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private worksorderService: WorksorderService,
    private commonService: CommonService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public route: ActivatedRoute) {

    this.router.events.subscribe(async () => {
      const isModalOpened = await this.modalController.getTop();
      if (router.url.toString() === "/login" && isModalOpened) this.dismiss();
    });

  }

  ngOnInit() {
    this.initUploadDocForm();
    this.initjobCompletionForm();
    this.getMaxQuoteRejection();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  get photos(): FormArray {
    return this.uploadPhotoForm.get('photos') as FormArray;
  };

  get invoices(): FormArray {
    return this.uploadDocumentForm.get('invoices') as FormArray;
  };

  private initjobCompletionForm(): void {
    if (this.actionType !== 'view') {
      this.jobCompletionForm = this.formBuilder.group({
        isAnyFurtherWork: false,
        isAccepted: true,
        additionalWorkDetails: '',
        jobCompletionDate: ['', Validators.required],
        submittedById: '',
        additionalEstimate: null,
        submittedByType: 'SECUR_USER'
      });
    } else {
      this.jobCompletionForm = this.formBuilder.group({
        isAnyFurtherWork: { value: this.isAnyFurtherWork, disabled: true },
        isAccepted: true,
        additionalWorkDetails: { value: this.additionalWorkDetails, disabled: true },
        jobCompletionDate: { value: this.jobCompletionDate, disabled: true },
        submittedById: '',
        additionalEstimate: { value: this.additionalEstimate, disabled: true },
        submittedByType: 'SECUR_USER'
      });
    }
  }

  private initUploadDocForm(): void {
    this.uploadDocumentForm = this.formBuilder.group({
      invoices: this.formBuilder.array([])
    });
    this.uploadPhotoForm = this.formBuilder.group({
      photos: this.formBuilder.array([])
    });
  }

  removeFile(i, type: string) {
    if (type === 'invoice') {
      this.uploadedInvoice.splice(i, 1);
      this.invoices.removeAt(i);
    } else {
      this.uploadedPhoto.splice(i, 1);
      this.photos.removeAt(i);
      if (this.uploadedPhoto.length == 0) {
        this.isLimitExceed = true;
      }
    }
  }

  private createItem(data): FormGroup {
    return this.formBuilder.group(data);
  }

  uploadDocument(uploadedDocument, type: string) {
    if (((this.uploadedPhoto.length + uploadedDocument.length > 5) && type === 'photo') || ((this.uploadedInvoice.length + uploadedDocument.length > 5) && type === 'invoice')) {
      this.commonService.showMessage("You are only allowed to upload a maximum of 5 document", "Warning", "warning");
      return;
    }

    if (uploadedDocument) {
      for (let file of uploadedDocument) {
        let isImage: boolean = false;
        if (file.type.split("/")[0] !== 'image') {
          isImage = false;
        }
        else if (file.type.split("/")[0] == 'image') {
          isImage = true;
        }
        if (type === 'photo') {
          this.isLimitExceed = false;
          this.photos.push(this.createItem({
            file: file
          }));
        } else {
          this.invoices.push(this.createItem({
            file: file
          }));
        }
        let reader = new FileReader();
        if (isImage && type === 'photo') {
          reader.onload = (e: any) => {
            this.uploadedPhoto.push({
              documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result),
              name: file.name
            })
          }
        }
        else if (isImage && type === 'invoice') {
          reader.onload = (e: any) => {
            this.uploadedInvoice.push({
              documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result),
              name: file.name
            })
          }
        }
        else {
          reader.onload = (e: any) => {
            this.uploadedInvoice.push({
              documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/default.jpg'),
              name: file.name
            })
          }
        }
        reader.readAsDataURL(file);
      }
    }
  }

  onCancel() {
    // const cancel = this.commonService.showConfirm('Quote Assessment', 'Are you sure to cancel ?', '', 'Yes', 'No');
    // if (!cancel) return;
    this.dismiss();
  }

  async onProceed() {
    this.isLimitExceed = false;
    if (this.validateReq()) {
      if (this.QUOTE_LIMIT && this.QUOTE_LIMIT < this.confirmedEstimate && this.uploadedPhoto.length == 0) {
        this.isLimitExceed = true;
        return;
      }
      if (this.actionType === 'view') {
        this.uploadWODocuments();
      } else {
        const completionDateUpdated = await this.submitWorksOrderCompletion();
        if (completionDateUpdated) {
          this.uploadWODocuments();
        }
      }
    }
  }

  private async uploadWODocuments() {
    if ((this.uploadedInvoice && this.uploadedInvoice.length) || (this.uploadedPhoto && this.uploadedPhoto.length)) {
      const docsUploaded = await this.uploadQuotes();
      if (docsUploaded) {
        this.modalController.dismiss('success');
      }
    }
    else {
      this.modalController.dismiss('success');
    }
  }

  async uploadQuotes() {
    this.showLoader = true;
    let apiObservableArray = [];
    const faultData = await this.prepareUploadData('invoice');
    const photos = await this.prepareUploadData('completion');
    apiObservableArray = apiObservableArray.concat(faultData);
    apiObservableArray = apiObservableArray.concat(photos);
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        forkJoin(apiObservableArray).subscribe(() => {
          this.showLoader = false;
          resolve(true);
        }, err => {
          this.commonService.showMessage('Something went wrong', 'Upload Invoice', 'error');
          this.showLoader = false;
          resolve(false);
        });
      }, 1000);
    });
    return promise;
  }

  private async prepareUploadData(type) {
    const promise = new Promise((resolve, reject) => {
      let apiObservableArray = [];
      let uploadedDoc = (type === 'invoice') ? this.uploadDocumentForm.controls.invoices.value : this.uploadPhotoForm.controls.photos.value;
      uploadedDoc.forEach(data => {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('name', data.file.name);
        if (type === 'invoice') {
          formData.append('folderName', FOLDER_NAMES[5].index);
          formData.append('documentType', 'WORKSORDER');
          apiObservableArray.push(this.worksorderService.uploadFaultDocument(formData, this.faultId));
        }
        else if (type === 'completion') {
          formData.append('folderName', FOLDER_NAMES[4].index);
          formData.append('documentType', 'WORKSORDER');
          apiObservableArray.push(this.worksorderService.uploadFaultDocument(formData, this.faultId));
        }
      });
      resolve(apiObservableArray);
    });
    return promise;
  }

  private submitWorksOrderCompletion() {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.worksorderService.saveWorksOrderCompletion(this.prepareData(), this.actionType === 'regular' ? this.faultNotificationId : this.faultId, this.actionType).subscribe(
        res => {
          this.commonService.showMessage('Success', 'Job Completed', 'success');
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false);
        }
      );
    });
    return promise;
  }

  private prepareData() {
    const reqqObj: any = JSON.parse(JSON.stringify(this.jobCompletionForm.getRawValue()));
    if (reqqObj.additionalEstimate === (null || '')) {
      reqqObj.additionalEstimate = 0;
    }
    reqqObj.jobCompletionDate = this.commonService.getFormatedDate(this.jobCompletionForm.value.jobCompletionDate, 'yyyy-MM-dd');
    return reqqObj;
  }

  private validateReq() {
    let valid = true;
    if (this.actionType !== 'view' && !this.jobCompletionForm.valid) {
      this.commonService.showMessage('Job completion date is required', 'Mark the Job Completed', 'error');
      this.jobCompletionForm.markAllAsTouched(); return valid = false;
    }
    if (this.actionType === 'view' && this.uploadDocumentForm.controls.invoices.value.length === 0) {
      this.commonService.showMessage('Please upload Invoice', 'Mark the Job Completed', 'error');
      return valid = false;
    }
    return valid;
  }

  enableAnyFurtherWork() {
    if (this.jobCompletionForm.value.isAnyFurtherWork) {
      this.jobCompletionForm.controls.additionalEstimate.setValidators([Validators.required]);
      this.jobCompletionForm.controls.additionalWorkDetails.setValidators([Validators.required]);
      this.jobCompletionForm.controls.additionalEstimate.updateValueAndValidity();
      this.jobCompletionForm.controls.additionalWorkDetails.updateValueAndValidity();
    }
    else {
      this.jobCompletionForm.controls.additionalEstimate.setValue('');
      this.jobCompletionForm.controls.additionalWorkDetails.setValue('');
      this.jobCompletionForm.controls.additionalEstimate.clearValidators();
      this.jobCompletionForm.controls.additionalWorkDetails.clearValidators();
      this.jobCompletionForm.controls.additionalEstimate.updateValueAndValidity();
      this.jobCompletionForm.controls.additionalWorkDetails.updateValueAndValidity();
    }
  }

  private getMaxQuoteRejection(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemConfig(MAX_QUOTE_LIMIT.FAULT_LARGE_QUOTE_LIMIT).subscribe(res => {
        this.QUOTE_LIMIT = res ? parseInt(res.FAULT_LARGE_QUOTE_LIMIT, 10) : '';
        resolve(true);
      }, error => {
        resolve(false);
      });
    });
    return promise;
  }
}
