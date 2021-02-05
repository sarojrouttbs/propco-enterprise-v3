import { Injectable, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonRouterOutlet, ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AutocloseOverlaysService {

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;

  constructor(
    private modalController: ModalController
  ) { }

  async trigger() {
    try {
      const modal = await this.modalController.getTop();
      if (modal) {
        modal.dismiss();
        return;
      }
    } catch (error) {
      console.log(error);

    }
  }
}
