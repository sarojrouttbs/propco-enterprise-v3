import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';
@Component({
  selector: 'app-pending-notification-modal',
  templateUrl: './pending-notification-modal.page.html',
  styleUrls: ['./pending-notification-modal.page.scss'],
})
export class PendingNotificationModalPage {

  notificationHistoryId;
  notificationSubject;
  notificationBody;

  constructor(
    private modalController: ModalController,
    private faultsService: FaultsService
  ) { }

  save() {
    return new Promise((resolve) => {
      this.faultsService.forwardNotification(this.notificationHistoryId).subscribe(
        res => {
          resolve(true);
          this.modalController.dismiss('success');
        },
        error => {
          resolve(false);
        }
      );
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
