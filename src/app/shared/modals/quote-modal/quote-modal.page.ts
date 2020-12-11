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
  uploadDocumentForm: FormGroup;
  uploadedDocument = [];
  type: string;

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
    this.type = 'quote'
    this.initUploadDocForm();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  get photos(): FormArray {
    return this.uploadDocumentForm.get('photos') as FormArray;
  };


  private initUploadDocForm(): void {
    this.uploadDocumentForm = this.formBuilder.group({
      photos: this.formBuilder.array([])
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
    console.log(uploadedDocument)
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
}
