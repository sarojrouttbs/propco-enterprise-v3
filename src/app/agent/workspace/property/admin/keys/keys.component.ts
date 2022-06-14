import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DEFAULTS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
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
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  propertyDetails: any;
  propertyKeySetList: any = [];
  keyActivities: any;
  keyStatuses: any;
  userDetailsList: any = [];
  logHistoryList: any = [];
  historyDtOption: DataTables.Settings;
  historyDtTrigger: Subject<any> = new Subject();
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  propertyKeySetForm: FormGroup;
  selectedData: any;
  isAddKeyActivity: boolean;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  
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
    this.userDetailsList = await this.getUsersList();
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
    this.initKeySetApi();
  }

  private async initKeySetApi() {
    this.propertyKeySetList = await this.getKeysListing(this.selectedEntityDetails.entityId);
    this.setApplicationApplicants();
  }

  private initForm() {
    this.initPropertyKeySetForm();
  }

  private getUsersList() {
    const params = new HttpParams().set('hideLoader', 'true');
    const promise = new Promise((resolve, reject) => {
      this.agentService.getUsersList().subscribe(
        (res) => {
          if (res && res.data) {
            
          }
          resolve(res.data);
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
    if (item) {
      return item[0];
    }
  }

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          if (res && res.data) {
            this.keyCode.setValue(res.data?.keyCode);
            this.alarmCode.setValue(res.data?.alarmCode);
            this.keysNotes.setValue(res.data?.keysNotes);
          }
          resolve(res.data);
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
          if (res && res.data) {
            resolve(res.data);
          } else {
            resolve([]);
          }
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  // create form, update, delete, add

  private setApplicationApplicants() {
    this.updatePropertyKeySetForm(this.propertyKeySetList);
  }

  private initPropertyKeySetForm(): void {
    this.propertyKeySetForm = this._formBuilder.group({
      propertyKeySets: this._formBuilder.array([])
    });
  }

  // private createItem(): void {
  //   this.propertyKeySetFormArray.push(this._formBuilder.group({
  //     createdAt: [],
  //     keyId: [],
  //     keySetId: [],
  //     name: [],
  //     note: [],
  //     status: [],
  //     statusDescription: [],
  //     type: [],
  //     userId: []
  //   }));
  // }

  get propertyKeySetFormArray() {
    return this.propertyKeySetForm.get('propertyKeySets') as FormArray;
  }

  // addApplicant(control: FormControl, index: number) {
  //   this.propertyKeySetFormArray.push(this._formBuilder.group({
  //     surname: control.value.surname,
  //     forename: control.value.forename,
  //     email: control.value.email,
  //     mobile: control.value.mobile,
  //     applicationApplicantId: null,
  //     isLead: index === 0 ? true : false,
  //     createdById: null,
  //     createdBy: ENTITY_TYPE.AGENT,
  //     isAdded: true,
  //     isDeleted: false,
  //     title: control.value.title,
  //     applicantId: ''
  //   }
  //   ));
  //   this.propertyKeySetFormArray.removeAt(index);
  //   this.createItem();
  // }


  // removeCoApplicant(item: FormGroup, index: number) {
  //   this.commonService.showConfirm('Remove Applicant', 'Are you sure, you want to remove this applicant ?', '', 'YES', 'NO').then(response => {
  //     if (response) {
  //       if (item.controls['applicationApplicantId'].value) {
  //         this._tobService.deleteApplicationApplicant(this.applicationId, item.controls['applicationApplicantId'].value, { 'deletedBy': 'AGENT' }).subscribe(async (response) => {
  //           const applicants = await this.getApplicationApplicants(this.applicationId) as ApplicationModels.ICoApplicants;
  //           await this.setApplicationApplicants(applicants);
  //         });
  //       } else {
  //         this.propertyKeySetFormArray.removeAt(index);
  //       }
  //     }
  //   });
  // }

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

  showMenu(event, id, data, className, isCard?) {
    this.selectedData = data;
    const baseContainer = $(event.target).parents('.' + className);
    const divOverlay = $('#' + id);
    const baseContainerWidth = baseContainer.outerWidth(true);
    const baseContainerHeight = baseContainer.outerHeight(true);
    const baseContainerPosition = baseContainer.position();
    const baseContainerTop = baseContainerPosition.top;
    const divOverlayWidth = divOverlay.css('width', baseContainerWidth + 'px');
    const divOverlayHeight = divOverlay.height();
    const overlayContainerLeftPadding = (divOverlay.parent('.overlay-container').innerWidth() - divOverlay.parent('.overlay-container').width()) / 2;
    const divOverlayLeft = isCard ? baseContainerPosition.left : overlayContainerLeftPadding;

    let origDivOverlayHeight;
    let origDivOverlayTop;
    let divOverlayTopBottomPadding = 0;
    if (baseContainerHeight > 49) {
      divOverlayTopBottomPadding = (baseContainerHeight - 48) / 2;
    }

    if (baseContainerHeight > divOverlayHeight) {
      origDivOverlayHeight = baseContainerHeight;
      origDivOverlayTop = baseContainerTop + $('.dataTables_length').outerHeight(true);
    } else {
      origDivOverlayHeight = divOverlayHeight + (divOverlayTopBottomPadding * 2);
      const extraHeight = divOverlayHeight - baseContainerHeight;
      origDivOverlayTop = baseContainerTop - extraHeight - (divOverlayTopBottomPadding * 2) + $('.dataTables_length').outerHeight(true);
    }

    divOverlay.css({
      position: 'absolute',
      top: origDivOverlayTop,
      right: '0px',
      width: baseContainerWidth,
      height: origDivOverlayHeight,
      left: divOverlayLeft,
      paddingTop: divOverlayTopBottomPadding,
      paddingBottom: divOverlayTopBottomPadding
    });

    const gridDivOverlay = $('#grid-divoverlay');

    gridDivOverlay.css({
      width: divOverlay.width(),
      height: divOverlayHeight
    });

    divOverlay.delay(200).slideDown('fast');
    event.stopPropagation();
  }

  hideMenu(event?, id?) {
    const $divOverlay = $('#' + id);
    $divOverlay.delay(200).slideUp('fast');
    if (event) {
      event.stopPropagation();
    }
  }

  addKeysetLogHistory(keysetDetails: any) {
    this.selectedData = {};
    let activityType: any;
    if (keysetDetails.status === 1) {
      activityType = 2;
    } else {
      activityType = 1;
    }
    this.isAddKeyActivity = true;
    this.openKeyActivityModal(activityType);
  }

  editKeysetLogHistory() {
    this.isAddKeyActivity = false;
    this.openKeyActivityModal();
  }

  async openKeyActivityModal(activityType?) {
    const modal = await this.modalController.create({
      component: KeyActivityModalPage,
      cssClass: 'modal-container property-modal-container',
      componentProps: {
        userDetailsList: this.userDetailsList,
        data: this.selectedData,
        keyActivities: this.keyActivities,
        isAddKeyActivity: this.isAddKeyActivity,
        activityType: activityType
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      this.hideMenu('', 'divOverlay');
    });
    await modal.present();
  }

  ngOnDestroy() {
    this.historyDtTrigger.unsubscribe();
  }
}
