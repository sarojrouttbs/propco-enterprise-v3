import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { MarketAppraisalService } from 'src/app/market-appraisal/market-appraisal.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-book-ma-modal',
  templateUrl: './book-ma-modal.page.html',
  styleUrls: ['./book-ma-modal.page.scss'],
})
export class BookMaModalPage implements OnInit {

  bookMaForm: FormGroup;
  users: any;
  timeSlots: any;
  title: string;
  type: string;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  
  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private maService: MarketAppraisalService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initForm();
    this.getAssignedUsers();
  }

  initForm() {
    this.bookMaForm = this.formBuilder.group({
      assignToId: ['', Validators.required],
      dueDate: ['', Validators.required],
      timeSlot: ['', Validators.required],
      function: [''],
      category: [''],
      startAt: [''],
      stopAt: [''],
      taskNarration: ['', Validators.required],
      note: [''],
      emailConfirmation: [false],
    });
  }

  getAssignedUsers() {
    const promise = new Promise((resolve, reject) => {
      this.maService.getAssignedUsers().subscribe(
        (res) => {
          this.users = res && res.data ? res.data : '';
          resolve(res);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  getSlots() {
    if (this.bookMaForm.value.user && this.bookMaForm.value.date) {
      this.getAvailableSlots();
    }
  }

  getAvailableSlots() {
    let params = new HttpParams()
      .set("assignTo", this.bookMaForm.value.user)
      .set("viewingDate", this.commonService.getFormatedDate(this.bookMaForm.value.date));
    const promise = new Promise((resolve, reject) => {
      this.maService.getAvailableSlots(params).subscribe(
        (res) => {
          this.timeSlots = res && res.data ? res.data : '';
          resolve(res);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async openFollowupModal() {

    this.modalController.dismiss();
    if (this.type == 'book-ma') {
      const modal = await this.modalController.create({
        component: BookMaModalPage,
        cssClass: 'modal-container ma-modal-container',
        componentProps: {
          title: 'Book Follow Up',
          type: 'follow-up'
        },
        backdropDismiss: false
      });
      modal.onDidDismiss().then(async res => { });
      await modal.present();
    }

  }

}
