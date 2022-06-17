import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { CreateKeySetPage } from 'src/app/shared/modals/create-key-set/create-key-set.page';
import { KeyActivityModalPage } from 'src/app/shared/modals/key-activity-modal/key-activity-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-keys',
  templateUrl: './keys.component.html',
  styleUrls: ['./keys.component.scss'],
})
export class KeysComponent implements OnInit {
  keyCode = new FormControl('');
  alarmCode = new FormControl('');
  keysNotes = new FormControl('');
  lookupdata: any;
  localStorageItems: any;
  selectedEntityDetails = null;
  propertyDetails: any;
  propertyKeySetList: any;
  keyActivities: any;
  keyStatuses: any;
  userDetailsList: any;
  logHistoryList: any;
  historyDtOption: DataTables.Settings;
  historyDtTrigger: Subject<any> = new Subject();
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  propertyKeySetForm: FormGroup;
  selectedData: any;
  isAddKeyActivity: boolean;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  DATE_FORMAT = DATE_FORMAT;
  loginUserDetails: any;
  selectedItemForHistory: any;

  constructor(private modalController: ModalController, private commonService: CommonService, private agentService: AgentService, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.initKeys();
  }

  initKeys() {
    this.historyDtOption = this.buildDtOptions();
    setTimeout(() => {
      this.historyDtTrigger.next();
    }, 100);
    this.initForm();
    this.getLookupData();
    this.initApi();
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

  private setLookupData(data: any) {
    this.keyStatuses = data.keyStatuses;
    this.keyActivities = data.keyActivities;
  }

  private async initApi() {
    this.loginUserDetails = await this.getUserDetails();
    this.userDetailsList = await this.getUsersList();
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
    this.initKeySetApi();
  }

  private async initKeySetApi() {
    this.propertyKeySetList = [];
    this.propertyKeySetFormArray.clear();
    this.propertyKeySetList = await this.getKeysListing(this.selectedEntityDetails.entityId);
    this.setApplicationApplicants();
  }

  private initForm() {
    this.initPropertyKeySetForm();
  }

  private getUserDetails() {
    return new Promise((resolve, reject) => {
      this.commonService.getUserDetails().subscribe((res) => {
        if (res) {
          resolve(res?.data[0]);
        } else {
          resolve('');
        }
      }, error => {
        reject(error)
      });
    });
  }

  private getUsersList() {
    const promise = new Promise((resolve, reject) => {
      this.agentService.getUsersList().subscribe(
        (res) => {
          resolve(res?.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
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
    if (Array.isArray(item) && item.length > 0) {
      return item[0];
    }
  }

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          this.keyCode.setValue(res?.data?.keyCode);
          this.alarmCode.setValue(res?.data?.alarmCode);
          this.keysNotes.setValue(res?.data?.keysNotes);
          resolve(res?.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  private getKeysListing(propertyId: string) {
    const promise = new Promise((resolve, reject) => {
      this.agentService.getKeysListing(propertyId).subscribe(
        (res) => {
          resolve(res?.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  private setApplicationApplicants() {
    this.updatePropertyKeySetForm(this.propertyKeySetList);
  }

  private initPropertyKeySetForm(): void {
    this.propertyKeySetForm = this._formBuilder.group({
      propertyKeySets: this._formBuilder.array([])
    });
  }

  get propertyKeySetFormArray(): FormArray {
    return this.propertyKeySetForm.get('propertyKeySets') as FormArray;
  }

  private updatePropertyKeySetForm(keysList: any[]) {
    if (Array.isArray(keysList) && keysList.length > 0) {
      const keySetArray = this.propertyKeySetFormArray;
      keysList.forEach(element => {
        if (element.keySetId) {
          keySetArray.push(this._formBuilder.group({
            createdAt: element.createdAt,
            keyId: element.keyId,
            keySetId: element.keySetId,
            name: element.name,
            note: element.note,
            status: element.status,
            statusDescription: element.statusDescription,
            type: element.type,
            userId: element.userId
          }));
        }
      });
    }
  }

  private buildDtOptions(): DataTables.Settings {
    return {
      paging: true,
      searching: false,
      ordering: false,
      responsive: true,
      lengthMenu: [5, 10, 15],
      pageLength: 5,
    };
  }

  onHistoryClick(data: any) {
    this.hideMenu('', 'divOverlay');
    this.selectedItemForHistory = data;
    this.getkeysetLogHistory(data.keySetId);
  }

  private getkeysetLogHistory(keySetId: number) {
    this.agentService.getkeysetLogHistory(keySetId).subscribe(res => {
      this.logHistoryList = res && res.data ? res.data : [];
      this.rerenderHistoryTable();
    });
  }

  private rerenderHistoryTable(): void {
    if (this.dtElements && this.dtElements.last.dtInstance) {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.historyDtTrigger.next();
      });
    }
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, true);
  }

  hideMenu(event: any, id: any) {
    this.commonService.hideMenu(event, id);
  }

  addKeysetLogHistory(keysetDetails: any, keysetActivityType: number) {
    this.selectedData = {};
    this.isAddKeyActivity = true;
    this.selectedData.activityType = keysetActivityType;
    this.selectedData.keySetId = keysetDetails?.keySetId;
    this.selectedData.userId = this.loginUserDetails?.userId;
    this.openKeyActivityModal();
  }

  editKeysetLogHistory() {
    this.isAddKeyActivity = false;
    this.openKeyActivityModal();
  }

  private async openKeyActivityModal() {
    const modal = await this.modalController.create({
      component: KeyActivityModalPage,
      cssClass: 'modal-container property-modal-container',
      componentProps: {
        userDetailsList: this.userDetailsList,
        data: this.selectedData,
        keyActivities: this.keyActivities,
        isAddKeyActivity: this.isAddKeyActivity
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      this.hideMenu('', 'divOverlay');
      if (res.data && res.data == 'success') {
        this.isAddKeyActivity ? this.initKeySetApi() : this.getkeysetLogHistory(this.selectedItemForHistory.keySetId);
      }
    });
    await modal.present();
  }

  createKeyset() {
    this.openCreateKeysetModal();
  }

  private async openCreateKeysetModal() {
    const modal = await this.modalController.create({
      component: CreateKeySetPage,
      cssClass: 'modal-container property-modal-container',
      componentProps: {
        userDetailsList: this.userDetailsList,
        keyStatuses: this.keyStatuses,
        propertyId: this.selectedEntityDetails.entityId,
        loggedInUserId: this.loginUserDetails?.userId
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.initKeySetApi();
      }
    });
    await modal.present();
  }

  deleteKeyset(item: any) {
    this.commonService.showConfirm('Remove key Set', 'Are you sure you want to delete this key set?', '', 'YES', 'NO').then(response => {
      if (response) {
        if (item?.keySetId) {
          this.agentService.deleteKeyset(item.keySetId).subscribe(res => {
            this.initKeySetApi();
          });
        }
      }
    });
  }

  updateKeysetDetails(item: any) {
    if (item?.keySetId) {
      const requestObj = {
        name: item.name,
        keyId: item.keyId,
        type: item.type,
        postDate: this.commonService.getFormatedDate(item.createdAt),
        userId: item.userId,
        status: item.status,
        note: item.note
      }
      this.agentService.updateKeyset(item.keySetId, requestObj).subscribe(
        res => {
          this.initKeySetApi();
        },
        error => {
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Update Key Set', 'error');
        }
      );
    }
  }

  ngOnDestroy() {
    this.historyDtTrigger.unsubscribe();
  }
}
