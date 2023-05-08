import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AgentService } from '../agent/agent.service';
import { DEFAULT_MESSAGES, SYSTEM_CONFIG } from '../shared/constants';
import { CommonService } from '../shared/services/common.service';
import { TenantListModalPage } from './modals/tenant-list-modal/tenant-list-modal.page';
declare function openScreen(key: string): any;
@Component({
  selector: 'app-change-sharer',
  templateUrl: './change-sharer.page.html',
  styleUrls: ['./change-sharer.page.scss'],
})
export class ChangeSharerPage implements OnInit {
  incomingReqParams: any = {};
  singleTenantOption: boolean;
  constructor(private activatedRoute: ActivatedRoute,
    private commonService: CommonService,
    private modalController: ModalController,
    private agentService: AgentService) {
    var snapshot = activatedRoute.snapshot;
    this.incomingReqParams.propertyId = snapshot.queryParams.propertyId;
    this.incomingReqParams.agreementId = snapshot.queryParams.agreementId;
  }

  ngOnInit() {
    this.initApp();
  }

  initApp() {
    this.initApiCall();
  }

  private async initApiCall() {
    const sysConfig = await this.getOptions() as boolean;
    this.singleTenantOption = sysConfig;
    if (sysConfig !== null) {
      this.selectTenant();
    } else {
      this.commonService.showMessage(
        DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG,
        'Error',
        'error'
      );
      openScreen('CloseDialog');
    }
  }

  getOptions() {
    const params = new HttpParams()
      .set('option', SYSTEM_CONFIG.ENABLESINGLETENANTOPTION);
    return new Promise((resolve) => {
      this.agentService.getSyatemOptions(params).subscribe(
        (res) => {
          const option = res ? res[SYSTEM_CONFIG.ENABLESINGLETENANTOPTION] : '';
          resolve(option === 1 ? true : false);
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  private async selectTenant(message?: string) {
    const modal = await this.modalController.create({
      component: TenantListModalPage,
      cssClass: 'modal-container tenant-list la-modal-container',
      backdropDismiss: false,
      componentProps: {
        paramPropertyId: this.incomingReqParams.propertyId,
        paramMessage: message,
        paramAgreementId: this.incomingReqParams.agreementId,
        singleTenantOption: true
      }
    });

    modal.onDidDismiss().then(res => {
    });
    await modal.present();
  }
}
