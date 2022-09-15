import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { MarketAppraisalService } from 'src/app/market-appraisal/market-appraisal.service';
import { DATE_FORMAT } from '../../constants';
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
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private maService: MarketAppraisalService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initForm();
    this.initApi();
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

  async initApi() {
    await this.getAssignedUsers();
    this.getUserDetails();
  }

  getAssignedUsers() {
    return new Promise((resolve) => {
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
  }

  private getUserDetails() {
    return new Promise((resolve, reject) => {
      this.commonService.getUserDetails().subscribe((res) => {
        const userDeatil = res && res?.data ? res?.data[0] : '';
        this.bookMaForm.get('assignToId').patchValue(userDeatil.userId);
        resolve(true);
      }, error => {
        reject(error)
      });
    });
  }

  getSlots() {
    if (this.bookMaForm.value.assignToId && this.bookMaForm.value.dueDate) {
      this.getAvailableSlots();
    }
  }

  getAvailableSlots() {
    let params = new HttpParams()
      .set('assignTo', this.bookMaForm.value.assignToId)
      .set('viewingDate', this.commonService.getFormatedDate(this.bookMaForm.value.dueDate));
    return new Promise((resolve) => {
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
      modal.onDidDismiss();
      await modal.present();
    }

  }

}
