import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IonSlides, ModalController, ViewDidEnter } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, PROPCO, DEFAULT_MESSAGES, DEFAULTS, NOTES_TYPE, DATE_FORMAT } from 'src/app/shared/constants';
import { ImagePage } from 'src/app/shared/modals/image/image.page';
import { CommonService } from 'src/app/shared/services/common.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, ViewDidEnter {
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  propertyData: any = '';
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  activeLink;
  propertyLandlords: any;
  propertyTenants: any;
  propertyDetails: any;
  options: any;
  notes: any;
  dtOptions: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  notesCategories: any;
  notesComplaints: any;
  notesTypes: any;
  lookupdata: any;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  notAvailable = DEFAULTS.NOT_AVAILABLE
  type = 'viewings';
  isMenuShown = true;
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private modalCtrl: ModalController,
    private agentService: AgentService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initApi();
    const that = this;
    this.dtOptions = {
      paging: true,
      pagingType: 'full_numbers',
      serverSide: true,
      processing: true,
      searching: false,
      ordering: false,
      pageLength: 5,
      lengthMenu: [5, 10, 15],
      autoWidth: true,
      responsive: true,
      ajax: (tableParams: any, callback) => {
        let params = new HttpParams()
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set("hideLoader", "true")
          .set('entityId', this.selectedEntityDetails.entityId)
          .set('entityType', NOTES_TYPE.PROPERTY);
        that.agentService.getNotes(params).subscribe(res => {
          this.notes = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
      },
      language: {
        processing: '<ion-spinner name="dots"></ion-spinner>'
      }
    };
  }

  async initApi() {
    this.getLookupData();
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.getOptions();
    this.getPropertyDetails(this.selectedEntityDetails.entityId);
    this.getPropertyById(this.selectedEntityDetails.entityId);
    this.getPropertyLandlords(this.selectedEntityDetails.entityId);
    this.getPropertyTenant(this.selectedEntityDetails.entityId);
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data) {
    this.notesCategories = data.notesCategories;
    this.notesComplaints = data.notesComplaint;
    this.notesTypes = data.notesType;
  }

  getLookupValue(index, lookup, type?) {
    index = (type == 'category' && index) ? Number(index) : index;
    return this.commonService.getLookupValue(index, lookup);
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
          resolve(true);
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
          resolve(true);
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
          resolve(true);
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
          resolve(true);
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
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  next() {
    this.slides.slideNext();
  }

  prev() {
    this.slides.slidePrev();
  }

  showNoteDescription(noteText): void {
    if (noteText) {
      this.commonService.showAlert('Notes', noteText);
    }
  }
}


