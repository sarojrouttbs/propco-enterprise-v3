import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSlides, ModalController, ViewDidEnter } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS } from 'src/app/shared/constants';
import { ImagePage } from 'src/app/shared/modals/image/image.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, ViewDidEnter {

  propertyData: any = '';
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  activeLink;
  propertyLandlords: any;
  propertyTenants: any;
  propertyDetails: any;
  options: any;

  constructor(
    private modalCtrl: ModalController,
    private agentService: AgentService,
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initApi();
  }

  async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.getOptions();
    this.getPropertyDetails(this.selectedEntityDetails.entityId);
    this.getPropertyById(this.selectedEntityDetails.entityId);
    this.getPropertyLandlords(this.selectedEntityDetails.entityId);
    this.getPropertyTenant(this.selectedEntityDetails.entityId);
  }

  private fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getActiveTabEntityInfo() {
    let item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      this.router.navigate([
        `agent/workspace/property/${item[0].entityId}/dashboard`,
      ]);
      this.activeLink = item[0].entityId;
      return item[0];
    }
  }

  ionViewDidEnter() {
  }

  async openPreview(index) {
    const modal = await this.modalCtrl.create({
      component: ImagePage,
      cssClass: 'transparent-modal',
      componentProps: {
        imgList: this.propertyDetails.media,
        selectedIndex: index,
        baseUrl: this.options
      }
    });
    modal.present();
  }

  getPropertyById(propertyId) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyById(propertyId, params).subscribe(
        (res) => {
          this.propertyData = res && res.data ? res.data : '';          
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  getPropertyLandlords(propertyId) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyLandlords(propertyId, params).subscribe(
        (res) => {
          this.propertyLandlords = res && res.data ? res.data : '';
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  getPropertyTenant(propertyId) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyTenants(propertyId, params).subscribe(
        (res) => {
          this.propertyTenants = res && res.data ? res.data : '';
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  getPropertyDetails(propertyId) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          this.propertyDetails = res && res.data ? res.data : '';          
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  getOptions() {
    let params = new HttpParams()
      .set("hideLoader", "true")
      .set("option", "WEB_IMAGE_URL");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getSyatemOptions(params).subscribe(
        (res) => {
          this.options = res ? res.WEB_IMAGE_URL : '';
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }
}


