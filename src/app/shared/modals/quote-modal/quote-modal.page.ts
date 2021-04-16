import { FaultsService } from './../../../faults/faults.service';
import { QuoteService } from './quote.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { FOLDER_NAMES, MAX_QUOTE_LIMIT } from './../../../shared/constants';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-quote-modal',
  templateUrl: './quote-modal.page.html',
  styleUrls: ['./quote-modal.page.scss', '../../drag-drop.scss'],
})
export class QuoteModalPage implements OnInit {
  faultNotificationId;
  faultId;
  stage;
  maintenanceId;
  quoteAssessmentForm: FormGroup;
  uploadDocumentForm: FormGroup;
  uploadPhotoForm: FormGroup;
  uploadedQuote = [];
  uploadedPhoto = [];
  type: string = 'quote';
  QUOTE_LIMIT;
  confirmedEstimate;
  isLimitExceed = false;
  preUpload: boolean;
  MAX_DOC_UPLOAD_LIMIT;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private quoteService: QuoteService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private faultService: FaultsService) {

    this.router.events.subscribe(async () => {
      const isModalOpened = await this.modalController.getTop();
      if (router.url.toString() === "/login" && isModalOpened) this.dismiss();
    });

  }

  ngOnInit() {
    this.initUploadDocForm();
    this.initquoteAssessmentForm();
    this.getMaxQuoteAmount();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  get photos(): FormArray {
    return this.uploadPhotoForm.get('photos') as FormArray;
  };

  get quotes(): FormArray {
    return this.uploadDocumentForm.get('quotes') as FormArray;
  };

  private initquoteAssessmentForm(): void {
    this.quoteAssessmentForm = this.formBuilder.group({
      quoteAmount: ['', Validators.required],
      isAccepted: true,
      submittedById: '',
      submittedByType: 'SECUR_USER'
    });
  }

  private initUploadDocForm(): void {
    this.uploadDocumentForm = this.formBuilder.group({
      quotes: this.formBuilder.array([])
    });
    this.uploadPhotoForm = this.formBuilder.group({
      photos: this.formBuilder.array([])
    });
  }

  removeFile(i, type: string) {
    if (type === 'quote') {
      this.uploadedQuote.splice(i, 1);
      this.quotes.removeAt(i);
    } else {
      this.uploadedPhoto.splice(i, 1);
      this.photos.removeAt(i);
      if (this.uploadedPhoto.length == 0) {
        this.isLimitExceed = true;
      }
    }
  }

  async deleteDocument(i, type: string, documentId) {
    const response = await this.commonService.showConfirm('Delete Media/Document', 'Do you want to delete the media/document?', '', 'YES', 'NO');
    if (response) {
      this.quoteService.deleteDocument(documentId).subscribe(response => {
        this.removeFile(i, type);
      });
    }
  }

  private createItem(data): FormGroup {
    return this.formBuilder.group(data);
  }

  uploadDocument(uploadedDocument, type: string) {
    if (((this.uploadedPhoto.length + uploadedDocument.length) > 5 && type === 'photo') || ((this.uploadedQuote.length + uploadedDocument.length) > 5 && type === 'quote')) {
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
            this.isLimitExceed = false;
            this.photos.push(this.createItem({
              file: file
            }));
          } else {
            this.quotes.push(this.createItem({
              file: file
            }));
          }
          let reader = new FileReader();
          if (isImage && type === 'photo') {
            reader.onload = (e: any) => {
              this.uploadedPhoto.push({
                documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result),
                name: file.name,
                isImage: true
              })
            }
          }
          else if (isImage && type === 'quote') {
            reader.onload = (e: any) => {
              this.uploadedQuote.push({
                documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result),
                name: file.name,
                isImage: true
              })
            }
          }
          else {
            reader.onload = (e: any) => {
              this.uploadedQuote.push({
                documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl('assets/images/default.jpg'),
                name: file.name,
                isImage: false
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
      const docsUploaded = await this.uploadQuotes();
      if (docsUploaded) {
        let amountUpdated: boolean = false;
        if (this.preUpload) {
          amountUpdated = await this.updateQuoteAmount() as boolean;
        } else {
          amountUpdated = await this.submitQuoteAmout() as boolean;
        }
        if (amountUpdated) {
          this.modalController.dismiss('success');
        }
      } else {
        this.modalController.dismiss('success');
      }
    }
  }

  async uploadQuotes() {
    if ((this.uploadDocumentForm.controls.quotes.value === null || this.uploadDocumentForm.controls.quotes.value.length === 0) && this.uploadedQuote.length !== 0) {
      return true;
    }
    let apiObservableArray = [];
    const maintData = await this.prepareUploadData('maint');
    if (maintData) {
      const maintSuccess = await this.upload(maintData);
      if (maintSuccess) {
        const faultData = await this.prepareUploadData('fault');
        const photos = await this.prepareUploadData('photo');
        apiObservableArray = apiObservableArray.concat(faultData);
        apiObservableArray = apiObservableArray.concat(photos);
        const faultPhotoSuccess = await this.upload(apiObservableArray);
        if (faultPhotoSuccess) {
          return true;
        } else {
          return false;
        }
      } else {
        this.commonService.showMessage('Something went wrong', 'Upload Quote', 'error');
        return false;
      }
    }
  }

  private async upload(apiObservableArray) {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        forkJoin(apiObservableArray).subscribe(() => {
          resolve(true);
        }, err => {
          resolve(false);
        });
      }, 1000);
    });
    return promise;
  }

  private async prepareUploadData(type) {
    const promise = new Promise((resolve, reject) => {
      let apiObservableArray = [];
      let uploadedDoc = (type === 'fault' || type === 'maint') ? this.uploadDocumentForm.controls.quotes.value : this.uploadPhotoForm.controls.photos.value;
      uploadedDoc.forEach(data => {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('name', data.file.name);
        if (type === 'fault' || type === 'photo') {
          formData.append('folderName', FOLDER_NAMES[1]['index']);
          if (type === 'fault') {
            formData.append('documentType', 'QUOTE');
          }
          apiObservableArray.push(this.quoteService.uploadFaultDocument(formData, this.faultId));
        } else {
          formData.append('headCategory', 'Accounts');
          formData.append('subCategory', 'Invoices');
          apiObservableArray.push(this.quoteService.uploadMaintDocument(formData, this.maintenanceId));
        }
      });
      resolve(apiObservableArray);
    });
    return promise;
  }

  async submitQuoteAmout() {
    const promise = new Promise((resolve, reject) => {
      this.quoteService.saveNotificationQuoteAmount(this.quoteAssessmentForm.value, this.faultNotificationId).subscribe(
        res => {
          this.commonService.showMessage('Successfully Added', 'Quote Assessment', 'success');
          resolve(true);
        },
        error => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  private validateReq() {
    let valid = true;
    if (!this.quoteAssessmentForm.valid) { this.commonService.showMessage('Quote Amount is required', 'Quote Assessment', 'error'); return valid = false; }
    if (this.QUOTE_LIMIT && this.QUOTE_LIMIT < this.quoteAssessmentForm.value.quoteAmount && this.uploadedPhoto.length === 0) {
      this.isLimitExceed = true;
      return valid = false;
    } else {
      this.isLimitExceed = false;
    }
    if (this.uploadedQuote.length == 0) { this.commonService.showMessage('Quote Document is required', 'Quote Assessment', 'error'); return valid = false; }
    return valid;
  }

  private getMaxQuoteAmount(): Promise<any> {
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

  updateQuoteAmount() {
    let requestObj = {
      quoteAmount: this.quoteAssessmentForm.value.quoteAmount,
      submittedByType: 'SECUR_USER'
    }
    const promise = new Promise((resolve, reject) => {
      this.quoteService.saveQuoteAmount(requestObj, this.faultId).subscribe(
        res => {
          resolve(true);
        },
        error => {
          resolve(false);
        }
      );
    });
    return promise;
  }
}
