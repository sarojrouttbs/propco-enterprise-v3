import { QuoteService } from './quote.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { CommonService } from '../../services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-quote-modal',
  templateUrl: './quote-modal.page.html',
  styleUrls: ['./quote-modal.page.scss', '../../drag-drop.scss'],
})
export class QuoteModalPage implements OnInit {
  faultNotificationId;
  faultId;
  maintenanceId;
  quoteAssessmentForm: FormGroup;
  uploadDocumentForm: FormGroup;
  uploadPhotoForm: FormGroup;
  uploadedQuote = [];
  uploadedPhoto = [];
  type: string = 'quote';

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private quoteService: QuoteService,
    private location: PlatformLocation,
    private router: Router,
    private sanitizer: DomSanitizer) {

    this.router.events.subscribe((val) => {
      if (val) {
        this.dismiss();
      }
    });
    this.location.onPopState(() => this.dismiss());

  }

  ngOnInit() {
    this.initUploadDocForm();
    this.initquoteAssessmentForm();
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
          this.quotes.push(this.createItem({
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
        else if (isImage && type === 'quote') {
          reader.onload = (e: any) => {
            this.uploadedQuote.push({
              documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result),
              name: file.name
            })
          }
        }
        else {
          reader.onload = (e: any) => {
            this.uploadedQuote.push({
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
    if (this.validateReq()) {
      const docsUploaded = await this.uploadQuotes();
      if (docsUploaded) {
        const amountUpdated = await this.submitQuoteAmout();
        if (amountUpdated) {
          this.modalController.dismiss('success');
        }
      }
    }
  }

  async uploadQuotes() {
    let apiObservableArray = [];
    const maintData = await this.prepareUploadData('fault');
    const faultData = await this.prepareUploadData('maint');
    const photos = await this.prepareUploadData('photo');
    apiObservableArray = apiObservableArray.concat(maintData);
    apiObservableArray = apiObservableArray.concat(faultData);
    apiObservableArray = apiObservableArray.concat(photos);
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        forkJoin(apiObservableArray).subscribe(() => {
          resolve(true);
        }, err => {
          this.commonService.showMessage('Something went wrong', 'Upload Quote', 'error');
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
          formData.append('folderName', 'quote_estimates');
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
    if (this.uploadedQuote.length == 0) { this.commonService.showMessage('Quote Document is required', 'Quote Assessment', 'error'); return valid = false; }
    return valid;
  }
}
