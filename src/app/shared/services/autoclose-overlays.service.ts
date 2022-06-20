import { Injectable, QueryList, ViewChildren } from '@angular/core';
import { AlertController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutocloseOverlaysService {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  constructor(
    private modalController: ModalController,
    private alertCtrl: AlertController
  ) { }

  async trigger() {
    try {
      const modal = await this.modalController.getTop();
      const alertBox = await this.alertCtrl.getTop();
      if (modal) {
        modal.dismiss();
        return;
      }
      if (alertBox) {
        alertBox.dismiss();
        return;
      }
    } catch (error) {
      if (!environment.production) {
        console.log(error);
      }
    }
  }
}
