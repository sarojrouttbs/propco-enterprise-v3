import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { WorksorderService } from './worksorder.service';
import { FOLDER_NAMES } from '../../constants';


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
  invoiceAmount;
  isAnyFurtherWork;
  additionalEstimate;
  additionalWorkDetails;
  MAX_DOC_UPLOAD_LIMIT;

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
        jobCompletionAt: ['', Validators.required],
        submittedById: '',
        additionalEstimate: null,
        submittedByType: 'SECUR_USER',
        invoiceAmount: ''
      });
    } else {
      this.jobCompletionForm = this.formBuilder.group({
        isAnyFurtherWork: { value: this.isAnyFurtherWork, disabled: true },
        isAccepted: true,
        additionalWorkDetails: { value: this.additionalWorkDetails, disabled: true },
        jobCompletionAt: { value: this.commonService.getFormatedDate(this.jobCompletionDate, 'yyyy-MM-ddTHH:mm'), disabled: true },
        submittedById: '',
        additionalEstimate: { value: this.additionalEstimate, disabled: true },
        submittedByType: 'SECUR_USER',
        invoiceAmount: this.invoiceAmount
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
        if (this.validateUploadLimit(file)) {

          let isImage: boolean = false;
          if (file.type.split("/")[0] !== 'image') {
            isImage = false;
          }
          else if (file.type.split("/")[0] == 'image') {
            isImage = true;
          }
          if (type === 'photo') {
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
  }

  validateUploadLimit(file) {
    if (!file) { return; }
    let fileSize = file.size / 1024 / 1024;
    if (fileSize > this.MAX_DOC_UPLOAD_LIMIT) {
      this.commonService.showAlert('Warning', `Some file(s) can't be uploaded, because they exceed the maximum allowed file size(${this.MAX_DOC_UPLOAD_LIMIT}Mb)`);
      return false;
    }
    return true;
  }

  onCancel() {
    // const cancel = this.commonService.showConfirm('Quote Assessment', 'Are you sure to cancel ?', '', 'Yes', 'No');
    // if (!cancel) return;
    this.dismiss();
  }

  async onProceed() {
    if (this.validateReq()) {
      if (this.actionType === 'view') {
        const updateAmount = await this.updateInvoiceAmount();
        if (updateAmount) {
          this.uploadWODocuments();
        }
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
    reqqObj.jobCompletionAt = this.commonService.getFormatedDate(this.jobCompletionForm.value.jobCompletionAt, 'yyyy-MM-dd HH:mm:ss');
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
    if (this.uploadDocumentForm.controls.invoices.value.length > 0 && !this.jobCompletionForm.value.invoiceAmount) {
      this.commonService.showMessage('Please add invoice amount', 'Mark the Job Completed', 'error');
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

  private updateInvoiceAmount() {
    this.showLoader = true;
    const promise = new Promise((resolve, reject) => {
      let req: any = {};
      req.invoiceAmount = this.jobCompletionForm.value.invoiceAmount;
      this.worksorderService.updateInvoiceAmount(req, this.faultId).subscribe(
        res => {
          this.commonService.showMessage('Success', 'Invoice Amount Updated', 'success');
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
}
