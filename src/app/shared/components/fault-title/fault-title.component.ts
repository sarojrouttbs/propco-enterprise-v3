import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
import { NOTES_ORIGIN, NOTES_TYPE } from '../../constants';
import { ChronologicalHistoryPage } from '../../modals/chronological-history/chronological-history.page';
import { NotesModalPage } from '../../modals/notes-modal/notes-modal.page';
import { SendEmailModalPage } from '../../modals/send-email-modal/send-email-modal.component';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-fault-title',
  templateUrl: './fault-title.component.html',
  styleUrls: ['./fault-title.component.scss'],
})
export class FaultTitleComponent implements OnInit {
  @Input() faultDetails;
  @Input() describeFaultForm;
  @Input() title;
  @Input() faultNotificationDetails;
  @Input() propertyDetails;
  @Input() categoryName;
  isEditable = false;

  constructor(
    private faultsService: FaultsService,
    private commonService: CommonService,
    private modalController: ModalController
  ) { }

  ngOnInit() {    
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.faultNotificationDetails && changes.faultNotificationDetails.currentValue){
      this.faultNotificationDetails = changes.faultNotificationDetails.currentValue;           
    }
  }

  editTitle() {
    this.isEditable = true;
  }

  changeTitle(title: any) {
    this.describeFaultForm.controls['title'].setValue(title);
    if (title) {
      let reqObj: any = {};
      reqObj.title = title;
      reqObj.stage = this.faultDetails.stage;
      reqObj.isDraft = this.faultDetails.isDraft;
      reqObj.submittedByType = 'SECUR_USER';
      reqObj.submittedById = ''
      this.saveFaultDetails(reqObj, this.faultDetails?.faultId);
    }
    this.isEditable = false;
  }

  private async saveFaultDetails(data, faultId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveFaultDetails(faultId, data).subscribe(
        res => {
          this.commonService.showMessage('Title has been updated successfully.', 'Fault', 'success');
          resolve(true);
        },
        error => {
          reject(false)
        }
      );
    });
    return promise;
  }

  async notesModal() {    
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container fault-modal-container',
      componentProps: {
        notesType: NOTES_TYPE.FAULT,
        notesTypeId: this.faultDetails?.faultId,
        isAddNote: true,
        notesOrigin: NOTES_ORIGIN.FAULT_STAGE,
        faultNotificationDetails: this.faultNotificationDetails,
        reference: this.faultDetails?.reference
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
    });

    await modal.present();
  }

  async cronologicalHistoryModal() {
    const modal = await this.modalController.create({
      component: ChronologicalHistoryPage,
      cssClass: 'modal-container chronological-history fault-modal-container',
      componentProps: {
        faultDetails: this.faultDetails,
        propertyDetails: this.propertyDetails
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
    });

    await modal.present();
  }

  async sendEmailModal() {
    const modal = await this.modalController.create({
      component: SendEmailModalPage,
      cssClass: 'modal-container send-email-modal fault-modal-container',
      componentProps: {
        faultDetails: this.faultDetails,
        propertyDetails: this.propertyDetails,
        faultCategoryName: this.categoryName
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.commonService.showMessage('Email has been sent successfully', 'Send Email', 'success');
        return;
      }
    });

    await modal.present();
  }
}
