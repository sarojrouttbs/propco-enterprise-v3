import { FaultsService } from 'src/app/faults/faults.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { WorksorderService } from './worksorder.service';
import { DATE_FORMAT, FOLDER_NAMES } from '../../constants';


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
  stage;
  unSavedData = false;
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private worksorderService: WorksorderService,
    private commonService: CommonService,
    private router: Router,
    private sanitizer: DomSanitizer,
    public route: ActivatedRoute,
    private faultsService: FaultsService) {

    this.router.events.subscribe(async () => {
      const isModalOpened = await this.modalController.getTop();
      if (router.url.toString() === '/login' && isModalOpened) this.dismiss();
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
  }

  get invoices(): FormArray {
    return this.uploadDocumentForm.get('invoices') as FormArray;
  }

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
        isAnyFurtherWork: this.isAnyFurtherWork,
        isAccepted: true,
        additionalWorkDetails: this.additionalWorkDetails,
        jobCompletionAt: { value: this.commonService.getFormatedDate(this.jobCompletionDate, this.DATE_FORMAT.YEAR_DATE_TIME_1), disabled: true },
        submittedById: '',
        additionalEstimate: this.additionalEstimate ? this.additionalEstimate : '',
        submittedByType: 'SECUR_USER',
        invoiceAmount: this.invoiceAmount ? this.invoiceAmount : ''
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
      this.commonService.showMessage('You are only allowed to upload a maximum of 5 document', 'Warning', 'warning');
      return;
    }
    if (uploadedDocument) {
      for (let file of uploadedDocument) {
        if (this.validateUploadLimit(file)) {

          let isImage: boolean = false;
          if (file.type.split('/')[0] !== 'image') {
            isImage = false;
          }
          else if (file.type.split('/')[0] == 'image') {
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

  async onProceed() {
    if (this.validateReq()) {
      if (this.actionType === 'view') {
        const updateAmount = await this.updateInvoiceAmount();
        const updateFurtherWorkDetails = await this.updateFurtherWorkDetails();
        if (updateAmount && updateFurtherWorkDetails) {
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
    return new Promise((resolve) => {
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
  }

  private async prepareUploadData(type) {
    return new Promise((resolve) => {
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
  }

  private submitWorksOrderCompletion() {
    this.showLoader = true;
    return new Promise((resolve) => {
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
  }

  private prepareData() {
    const reqqObj: any = JSON.parse(JSON.stringify(this.jobCompletionForm.getRawValue()));
    if (reqqObj.additionalEstimate === (null || '')) {
      reqqObj.additionalEstimate = 0;
    }
    reqqObj.jobCompletionAt = this.commonService.getFormatedDate(this.jobCompletionForm.value.jobCompletionAt, this.DATE_FORMAT.YEAR_DATE_TIME);
    return reqqObj;
  }

  private validateReq() {
    if (!this.jobCompletionForm.valid) {
      this.commonService.showMessage('Job completion details are required', 'Mark the Job Completed', 'error');
      this.jobCompletionForm.markAllAsTouched(); 
      return false;
    }
    if (this.actionType === 'view' && this.uploadDocumentForm.controls.invoices.value.length === 0) {
      this.commonService.showMessage('Please upload Invoice', 'Mark the Job Completed', 'error');
      return false;
    }
    if (this.uploadDocumentForm.controls.invoices.value.length > 0 && !this.jobCompletionForm.value.invoiceAmount) {
      this.commonService.showMessage('Please add invoice amount', 'Mark the Job Completed', 'error');
      return false;
    }
    return true;
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
    return new Promise((resolve) => {
      let req: any = {};
      req.invoiceAmount = this.jobCompletionForm.value.invoiceAmount;
      req.stage = this.stage;
      req.isDraft = true;
      req.submittedByType = 'SECUR_USER';
      req.submittedById = '';
      this.faultsService.updateFault(this.faultId, req).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false);
        }
      );
    });
  }

  private updateFurtherWorkDetails() {
    this.showLoader = true;
    return new Promise((resolve) => {
      let reqObj: any = {};
      reqObj.stage = this.stage;
      reqObj.isDraft = false;
      reqObj.submittedByType = 'SECUR_USER';
      reqObj.submittedById = ''
      reqObj.isAnyFurtherWork = this.jobCompletionForm.value.isAnyFurtherWork;
      reqObj.additionalWorkDetail = this.jobCompletionForm.value.additionalWorkDetails;
      reqObj.additionalEstimate = this.jobCompletionForm.value.additionalEstimate ? this.jobCompletionForm.value.additionalEstimate : 0;
      this.faultsService.saveFaultDetails(this.faultId, reqObj).subscribe(
        res => {
          this.showLoader = false;
          resolve(true);
        },
        error => {
          this.showLoader = false;
          resolve(false);
        }
      );
    });
  }


  async onCancel() {
    if ((this.uploadDocumentForm.controls.quotes && this.uploadDocumentForm.controls.quotes.value.length !== 0)
      || (this.uploadPhotoForm.controls.photos && this.uploadPhotoForm.controls.photos.value.length !== 0)
      || this.jobCompletionForm.value.isAnyFurtherWork
      || this.jobCompletionForm.value.additionalWorkDetails
      || this.jobCompletionForm.value.jobCompletionAt
      || this.jobCompletionForm.value.additionalEstimate
      || this.jobCompletionForm.value.invoiceAmount) {
      this.unSavedData = true;
    } else {
      this.dismiss();
    }
  }

  continue() {
    this.unSavedData = false;
  }

  onBlurCurrency(val: any, form: FormGroup) {
    if (!val) {
      if (form == this.jobCompletionForm) {
        this.jobCompletionForm.patchValue({
          invoiceAmount: '',
        });
      }
    }
  }

  onBlurAdditionalEstimate(val: any, form: FormGroup) {
    if (!val) {
      if (form == this.jobCompletionForm) {
        this.jobCompletionForm.patchValue({
          additionalEstimate: '',
        });
      }
    }
  }
}
