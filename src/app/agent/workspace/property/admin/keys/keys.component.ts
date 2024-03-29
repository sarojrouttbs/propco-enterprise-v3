import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { CreateKeySetPage } from './keys-modal/create-key-set/create-key-set.page';
import { KeyActivityModalPage } from './keys-modal/key-activity-modal/key-activity-modal.page';
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
  logHistoryList = [];
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
  selecteKeysetData: any;

  isPropertyPropertyKeysetAvailable = false;

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
    this.setKeysetDetails();
  }

  private initForm() {
    this.initPropertyKeySetForm();
  }

  private getUserDetails() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this.agentService.getUserDetails(params).subscribe((res) => {
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
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getUsersList(params).subscribe(
        (res) => {
          resolve(res?.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
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
    return new Promise((resolve) => {
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
  }

  private getKeysListing(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getKeysListing(propertyId, params).subscribe(
        (res) => {
          resolve(res?.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  private setKeysetDetails() {
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
            createdAt: [element.createdAt, Validators.required],
            keyId: [element.keyId, Validators.maxLength(50)],
            keySetId: element.keySetId,
            name: [element.name, Validators.maxLength(50)],
            note: [element.note, Validators.maxLength(255)],
            status: element.status,
            statusDescription: element.statusDescription,
            type: [element.type, Validators.maxLength(40)],
            userId: element.userId
          }));
        }
      });
    }
    this.isPropertyPropertyKeysetAvailable = true;
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
    this.hideMenu('', 'key-overlay');
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
    this.selecteKeysetData = keysetDetails;
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
      cssClass: 'modal-container key-activity-modal property-modal-container',
      componentProps: {
        userDetailsList: this.userDetailsList,
        data: this.selectedData,
        keyActivities: this.keyActivities,
        isAddKeyActivity: this.isAddKeyActivity
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      this.hideMenu('', 'key-overlay');
      if (res.data && res.data == 'success') {
        if (this.isAddKeyActivity) {
          this.updateKeysetStatus(this.selectedData);
        } else {
          this.getkeysetLogHistory(this.selectedItemForHistory.keySetId);
        }
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
      cssClass: 'modal-container create-keyset-modal property-modal-container',
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
    this.commonService.showConfirm('Remove Key Set', 'Are you sure you want to delete this key set?', '', 'YES', 'NO').then(response => {
      if (response) {
        if (item?.keySetId) {
          this.agentService.deleteKeyset(item.keySetId).subscribe(res => {
            this.initKeySetApi();
          });
        }
      }
    });
  }

  private updateKeysetStatus(item: any) {
    if (item?.keySetId) {
      const requestObj = {
        userId: this.selecteKeysetData.userId,
        status: item.activityType,
        postDate: this.commonService.getFormatedDate(this.selecteKeysetData.createdAt),
      }
      this.updateKeySetDetails(item.keySetId, requestObj);
    }
  }

  onUpdateKeyset(item: any, currentForm: FormControl) {
    if (currentForm.valid) {
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
        this.updateKeySetDetails(item.keySetId, requestObj);
      }
    } else {
      currentForm.markAllAsTouched();
    }
  }

  private updateKeySetDetails(keySetId: number, requestObj: any) {
    this.agentService.updateKeyset(keySetId, requestObj).subscribe(
      res => {
        this.initKeySetApi();
      },
      error => {
        this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Update Key Set', 'error');
      }
    );
  }

  ngOnDestroy() {
    this.historyDtTrigger.unsubscribe();
  }
}
