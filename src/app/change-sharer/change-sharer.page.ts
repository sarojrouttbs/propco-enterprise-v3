import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SYSTEM_CONFIG } from '../shared/constants';
import { CommonService } from '../shared/services/common.service';
import { TenantListModalPage } from './modals/tenant-list-modal/tenant-list-modal.page';

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
    private modalController: ModalController) {
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
    const sysConfig = await this.getSystemConfigs(SYSTEM_CONFIG.ENABLE_CHECK_FOR_EXISTING_RECORDS);
    this.singleTenantOption = sysConfig;
    if (this.singleTenantOption) {
      this.selectTenant();
    }
  }

  private async getSystemConfigs(key: string): Promise<any> {
    return new Promise((resolve) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(res[key] === '1' ? true : false);
      }, error => {
        resolve(true);
      });
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
        paramAgreementId: this.incomingReqParams.agreementId
      }
    });

    modal.onDidDismiss().then(res => {
      // if (res?.data?.tenantId) {
      //   if (res.data.referencingApplicationStatus == 0 || res.data.referencingApplicationStatus == 1) {
      //     this.applicationAlert();
      //   }
      //   else {
      //     this.tenantId = res.data.tenantId;
      //     this.tenantCaseId = res.data.tenantCaseId ? res.data.tenantCaseId : null;
      //     if (message) {
      //       this.router.navigate(['../add-application'], {
      //         relativeTo: this.route, queryParams: {
      //           pId: this.propertyId,
      //           tId: res.data.tenantId
      //         }
      //       }).then(() => {
      //         location.reload();
      //       });
      //     }
      //     else {
      //       this.initiateApplication();
      //     }
      //   }
      // } else {
      //   this.router.navigate(['../dashboard'], { replaceUrl: true, relativeTo: this.route });
      // }
    });
    await modal.present();
  }
}
