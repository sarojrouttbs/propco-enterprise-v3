import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { FaultsService } from 'src/app/faults/faults.service';
import { CommonService } from '../../services/common.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-quote-modal',
  templateUrl: './quote-modal.page.html',
  styleUrls: ['./quote-modal.page.scss', '../../drag-drop.scss'],
})
export class QuoteModalPage implements OnInit {
  faultNotificationId;
  quoteAssessmentForm: FormGroup;
  uploadDocumentForm: FormGroup;
  uploadedDocument = [];
  type: string = 'quote';

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService,
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
    return this.uploadDocumentForm.get('photos') as FormArray;
  };

  get quotes(): FormArray {
    return this.uploadDocumentForm.get('quotes') as FormArray;
  };

  private initquoteAssessmentForm(): void {
    this.quoteAssessmentForm = this.formBuilder.group({
      quoteAmount: ['', Validators.required],
      isAccepted: true,
      submittedById: '',
      submittedByType: 'AGENT'
    });
  }

  private initUploadDocForm(): void {
    this.uploadDocumentForm = this.formBuilder.group({
      photos: this.formBuilder.array([]),
      quotes: this.formBuilder.array([])
    });
  }

  removeFile(i) {
    this.uploadedDocument.splice(i, 1);
    this.photos.removeAt(i);
  }

  private createItem(data): FormGroup {
    return this.formBuilder.group(data);
  }

  uploadDocument(uploadedDocument) {
    if (this.uploadedDocument.length + uploadedDocument.length > 5) {
      this.commonService.showMessage("You are only allowed to upload a maximum of 5 uploadedDocument", "Warning", "warning");
      return;
    }
    if (uploadedDocument) {
      for (let file of uploadedDocument) {
        let isImage: boolean = false;
        // console.log(file.type.split("/")[0])
        if (file.type.split("/")[0] !== 'image') {
          isImage = false;
        }
        else if (file.type.split("/")[0] == 'image') {
          isImage = true;
        }
        this.photos.push(this.createItem({
          file: file
        }));
        let reader = new FileReader();
        if (isImage) {
          reader.onload = (e: any) => {
            this.uploadedDocument.push({
              documentUrl: this.sanitizer.bypassSecurityTrustResourceUrl(e.target.result),
              name: file.name
            })
          }
        }
        else {
          reader.onload = (e: any) => {
            this.uploadedDocument.push({
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

  onProceed() {
    switch (this.type) {
      case 'quote': {
        this.type = 'document'
        break;
      }
      case 'document': {
        this.type = 'photos'
        break;
      } default: {
        this.submit();
        break;
      }
    }
  }

  private async submit() {
    if (!this.validateReq()) return;
  }

  private async validateReq() {
    let valid = true;
    if (!this.quoteAssessmentForm.valid) { this.commonService.showMessage('Quote Amount is required', 'Quote Assessment', 'error'); return valid = false; }
    if (this.quotes.value.length == 0) { this.commonService.showMessage('Quote is required', 'Quote Assessment', 'error'); return valid = false; }
    return valid;
  }
}
