import { HttpParams } from '@angular/common/http';
import { ERROR_MESSAGE, FAULT_STATUSES, NOTES_TYPE, PROPCO, REPORTED_BY_TYPES, SYSTEM_CONFIG, URGENCY_TYPES, MAINT_SOURCE_TYPES, DEFAULT_MESSAGES } from './../../shared/constants';
import { CommonService } from './../../shared/services/common.service';
import { FaultsService } from './../faults.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NotesModalPage } from '../../shared/modals/notes-modal/notes-modal.page';
import { EscalateModalPage } from '../../shared/modals/escalate-modal/escalate-modal.page';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { IonicSelectableComponent } from 'ionic-selectable';
import { delay } from 'rxjs/operators';
import { CloseFaultModalPage } from 'src/app/shared/modals/close-fault-modal/close-fault-modal.page';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;

  notesDtOption: DataTables.Settings;
  faultsDtOption: Promise<DataTables.Settings>;
  dtTrigger: Subject<any> = new Subject();
  notesDtTrigger: Subject<any> = new Subject();
  faultList: any[];
  faultNotes: any[];
  selectedData: any;
  private lookupdata: any;
  faultCategories: any[];
  officeCodes: any[];
  faultStatuses: any[];
  faultUrgencyStatuses;
  notesCategories: any[];
  userLookupDetails: any[];
  notesComplaints: any[];
  notesTypes: any[];
  reportedByTypes = REPORTED_BY_TYPES;
  filterValue: number;
  isBranchFilter = false;
  isManagementFilter = false;
  isStatusFilter = false;
  isAssignToFilter = false;
  filterForm: FormGroup;
  accessibleOffices: any
  faultParams: any = new HttpParams();
  fs: number[] = [];
  fus: number[] = [];
  fcfd: string = '';
  fctd: string = '';
  managementTypeList: any;
  assignedUsers: AssignedUsers[];
  fat: string[] = [];
  fpo: string[] = [];
  fpm: number[] = [];
  isFilter = false;
  selectedMgmtType: any = [];
  page = 2;
  userList: any;
  assignToSubscription: Subscription;
  selectedFaultList: any = [];
  showEscalated = '';
  searchKey = new FormControl('');
  LET_CATEGORY;
  FULLY_MANAGED_PROPERTY_TYPES = [];
  private loadTable = true;
  activeRepairCount;
  activeRepairLoader = false;
  emergencyCount;
  emergencyLoader = false;
  urgentCount;
  urgentLoader = false;
  nonUrgentCount;
  nonUrgentLoader = false;
  assismentCount;
  assismentLoader = false;
  automationCount;
  automationLoader = false;
  invoiceCount;
  invoiceLoader = false;
  escalationCount
  escalationLoader = false;
  private bucketFpm: number[] = [];
  isBucketActive: boolean = false;
  isSnoozeFilter: boolean = false;
  minDate;
  futureDate;
  currentDate;
  maintSourceTypes = MAINT_SOURCE_TYPES;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  popoverOptions: any = {
    cssClass: 'fault-modal-container'
  };

  constructor(
    private commonService: CommonService,
    private modalController: ModalController,
    private router: Router,
    private faultsService: FaultsService,
    private fb: FormBuilder,
    public datepipe: DatePipe,
    private route: ActivatedRoute
  ) {
    this.getLookupData();
  }

  async ngOnInit() {
    this.loadTable = false;
    this.setSnoozeMinMaxDate();
    this.initFilterForm();
    this.notesDtOption = this.buildDtOptions();
    this.faultsDtOption = this.getFaultTableDtOption();
    setTimeout(() => {
      this.notesDtTrigger.next();
    }, 1000);
  }


  async getFaultTableDtOption(): Promise<DataTables.Settings> {
    const that = this;
    let dtOption = {
      paging: true,
      pagingType: 'full_numbers',
      serverSide: true,
      processing: true,
      searching: false,
      ordering: false,
      pageLength: 5,
      lengthMenu: [5, 10, 15],
      ajax: (tableParams: any, callback) => {
        this.commonService.showLoader();
        this.faultParams = this.faultParams
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1');
        if (this.fpm.length > 0) {
          this.faultParams = this.faultParams.set('fpm', this.fpm.toString());
        }
        that.faultsService.getAllFaults(this.faultParams).subscribe(res => {
          that.faultList = res && res.data ? res.data : [];
          this.faultList.forEach((item) => {
            item.isChecked = false;
          });
          this.selectCheckedFault();
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
          this.faultNotes = [];
          this.rerenderNotes();
        })
        this.hideMenu('', 'divOverlay');
      },
      language: {
        processing: '<div class="processing-wrapper"><ion-spinner name="dots"></ion-spinner></div>'
      }
    };
    const promise = new Promise(async (resolve, reject) => {
      this.LET_CATEGORY = this.commonService.getItem(PROPCO.LET_CATEGORY, true);
      if (!this.LET_CATEGORY) {
        let category = await this.getSystemConfigs(SYSTEM_CONFIG.FAULT_MANAGEMENT_LETCAT);
        if (category && parseInt(category)) {
          this.LET_CATEGORY = parseInt(category);
          this.commonService.setItem(PROPCO.LET_CATEGORY, this.LET_CATEGORY);
        }
      }
      await this.getMgntServiceType();
      this.bucketCount();
      resolve(dtOption)
    });
    return promise;
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      fromDate: [],
      toDate: [],
      filterType: [],
      branchfilter: [],
      managementFilter: [],
      statusFilter: [],
      repairCheckbox: [],
      newRepairs: [],
      emergency: [],
      urgent: [],
      nonUrgent: [],
      assessment: [],
      automation: [],
      invoice: [],
      escalation: [],
      selectedPorts: [],
      assignToFilter: [],
      showMyRepairs: [],
      snoozeUntil: []
    });

    this.filterForm.get('fromDate').valueChanges.subscribe(value => {
      if (value) {
        this.onDateChange();
      }
    });
    this.filterForm.get('toDate').valueChanges.subscribe(value => {
      if (value) {
        this.onDateChange();
      }
    });
    this.filterForm.get('snoozeUntil').valueChanges.subscribe(value => {
      if (value) {
        setTimeout(() => {
          this.filterList();
        }, 300)
      }
    });
  }

  ionViewDidEnter() {
    if (this.loadTable) {
      this.rerenderFaults(true);
      this.bucketCount();
    }
    this.loadTable = true;
    this.hideMenu('', 'divOverlay');
    this.commonService.removeItem('contractorId');
  }

  private async getSystemConfigs(key): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(res[key]);
      }, error => {
        resolve(true);
      });
    });
    return promise;
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
    let faultsLookupData = this.commonService.getItem(PROPCO.FAULTS_LOOKUP_DATA, true);
    if (faultsLookupData) {
      this.setFaultsLookupData(faultsLookupData);
    }
    else {
      this.commonService.getFaultsLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.FAULTS_LOOKUP_DATA, data);
        this.setFaultsLookupData(data);
      });
    }
  }

  private setLookupData(data) {
    this.officeCodes = data.officeCodes;
    this.notesCategories = data.notesCategories;
    this.userLookupDetails = data.userLookupDetails;
    this.notesComplaints = data.notesComplaint;
    this.notesTypes = data.notesType;
  }

  private setFaultsLookupData(data) {
    this.faultCategories = data.faultCategories;
    this.faultStatuses = data.faultStatuses.filter(x => x.index != FAULT_STATUSES.ESCALATION);
    this.faultUrgencyStatuses = data.faultUrgencyStatuses;
  }

  getLookupValue(index, lookup, type?) {
    index = (type == 'category' && index) ? Number(index) : index;
    return this.commonService.getLookupValue(index, lookup);
  }

  onClickRow(data, index?) {
    this.selectedData = data;
    this.getFaultNotes(this.selectedData.faultId);
    this.faultList.forEach((e, i) => {
      if (e.faultId === data.faultId) this.faultList[i].isSelected = true;
      else this.faultList[i].isSelected = false;
    });

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

  private getFaultNotes(faultId) {
    this.faultsService.getFaultNotes(faultId).subscribe(res => {
      this.faultNotes = res && res.data ? res.data : [];
      this.rerenderNotes();
    });
  }

  public addFault() {
    this.router.navigate(['../add'], { relativeTo: this.route });
  }

  async notesModal() {
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container fault-modal-container',
      componentProps: {
        notesType: NOTES_TYPE.FAULT,
        notesTypeId: this.selectedData.faultId,
        isAddNote: true
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
      if (res.data && res.data.noteId) {
        this.getFaultNotes(this.selectedData.faultId);
      }
    });
    await modal.present();
  }

  async escalateFault() {
    const headingText = 'Escalate Repair';
    const modal = await this.modalController.create({
      component: EscalateModalPage,
      cssClass: 'modal-container fault-modal-container',
      componentProps: {
        heading: headingText,
        faultId: this.selectedData.faultId
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data == 'success') {
        this.commonService.showAlert('Escalate Repair', 'Repair has been escalated to the property manager.');
        this.rerenderFaults(false);
        this.getFaultNotes(this.selectedData.faultId);
        this.hideMenu('', 'divOverlay');
        this.bucketCount();
      }
    });
    await modal.present();
  }

  async deEscalateFault() {
    this.commonService.showConfirm('De-Escalate Repair', 'Are you sure you want to de-escalate the repair?', '', 'Yes', 'No').then(res => {
      if (res) {
        this.faultsService.deEscalateFault(this.selectedData.faultId, {}).subscribe(res => {
          this.commonService.showAlert('De-Escalate Repair', 'Repair has been de-escalated to the property manager.');
          this.rerenderFaults(false);
          this.hideMenu('', 'divOverlay');
          this.bucketCount();
        }, error => {
        });
      }
    })
  }

  async closeFault() {
    const modal = await this.modalController.create({
      component: CloseFaultModalPage,
      cssClass: 'modal-container close-fault-modal fault-modal-container',
      componentProps: {
        faultId: this.selectedData.faultId,
        maintenanceId: this.selectedData.maintenanceId
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.commonService.showMessage('Repair has been closed successfully.', 'Close Repair', 'success');
        this.rerenderFaults(false);
        this.bucketCount();
        return;
      }
    });

    await modal.present();
  }

  async startProgress() {
    const check = await this.commonService.showConfirm('Start Progress', 'This will change the repair status, Do you want to continue?');
    if (check) {
      this.faultsService.startProgress(this.selectedData.faultId).subscribe(data => {
        this.router.navigate([`../${this.selectedData.faultId}/details`], { relativeTo: this.route });
      }, error => {
        this.commonService.showMessage(error.error || ERROR_MESSAGE.DEFAULT, 'Start Progress', 'Error');

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

  rerenderNotes(): void {
    if (this.dtElements && this.dtElements.last.dtInstance) {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.notesDtTrigger.next();
      });
    }
  }

  rerenderFaults(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }

  showNoteDescription(noteText): void {
    if (noteText) {
      this.commonService.showAlert('Notes', noteText);
    }
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
    this.notesDtTrigger.unsubscribe();
  }

  goToFaultDetails() {
    this.router.navigate([`../${this.selectedData.faultId}/details`], { relativeTo: this.route });
  }

  getaccessibleOffices() {
    this.faultsService.getaccessibleOffices().subscribe(res => {
      this.accessibleOffices = res && res.data ? res.data : [];
    });
  }

  getMgntServiceType() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getManagementTypes().subscribe(res => {
        this.managementTypeList = res ? res : [];
        if (this.managementTypeList) {
          for (var val of this.managementTypeList) {
            if (val.letCategory === this.LET_CATEGORY) {
              this.FULLY_MANAGED_PROPERTY_TYPES.push(val.index);
              this.fpm.push(val.index);
              this.bucketFpm = this.fpm;
              this.selectedMgmtType.push(val)
            }
          }
          this.filterForm.get('managementFilter').setValue(this.selectedMgmtType);
        }
        resolve(true);
      });
    });
    return promise;
  }

  getAssignedUsers() {
    this.faultsService.getAssignedUsers().subscribe(res => {
      this.userList = res && res.data ? res.data : [];
      this.assignedUsers = this.getUsers();

    });
  }

  onFiletrChange(e) {
    this.filterValue = e.detail.value;
    this.isFilter = true;

    if (this.filterValue == 1) {
      this.getaccessibleOffices();
      this.isBranchFilter = true;
    }

    if (this.filterValue == 2) {
      if (this.isBucketActive) return;
      this.isManagementFilter = true;
    }

    if (this.filterValue == 3) {
      if (this.isBucketActive) return;
      this.isStatusFilter = true;
    }

    if (this.filterValue == 4) {
      this.getAssignedUsers();
      this.isAssignToFilter = true;
    }

    if (this.filterValue == 5) {
      this.filterForm.get('snoozeUntil').setValue(this.futureDate);
      this.isSnoozeFilter = true;
    }
  }

  closeFilter(val) {
    if (val == 1) {
      this.isBranchFilter = false;
      this.fpo = [];
    }

    if (val == 2) {
      this.isManagementFilter = false;
      this.fpm = [];
    }

    if (val == 3) {
      this.isStatusFilter = false;
      this.fs = [];
    }

    if (val == 4) {
      this.isAssignToFilter = false;
      this.fat = [];
    }

    if (val == 5) {
      this.isSnoozeFilter = false;
      this.filterForm.get('snoozeUntil').setValue(null);
    }

    this.filterForm.get('filterType').reset();
    this.filterList();

  }

  resetFilter() {
    this.isBucketActive = false;
    this.isFilter = false;
    this.filterForm.reset();
    this.isBranchFilter = false;
    this.isManagementFilter = false;
    this.isStatusFilter = false;
    this.isAssignToFilter = false;
    this.isSnoozeFilter = false;
    this.fpm = this.FULLY_MANAGED_PROPERTY_TYPES;
    this.faultParams = new HttpParams().set('limit', '5').set('page', '1').set('fpm', this.fpm.toString());
    this.rerenderFaults();
    this.bucketCount();
    this.fs = [];
    this.fpo = [];
    this.fat = [];
    this.fcfd = '';
    this.fctd = '';
    this.filterForm.get('managementFilter').setValue(this.selectedMgmtType);
    this.showEscalated = '';
    this.searchKey.reset();
  }

  async checkboxClick(controlName?) {
    this.isFilter = true;
    this.fs = [];
    this.fus = [];
    this.showEscalated = '';
    const filterForm = this.filterForm as FormGroup;
    let checkBoxControls = ['repairCheckbox', 'newRepairs', 'emergency', 'urgent', 'nonUrgent', 'assessment', 'automation', 'invoice', 'escalation']

    if (controlName) {
      checkBoxControls.forEach(key => {
        if (controlName !== key) {
          filterForm.get(key).setValue(false);
        }
      });
    }
    setTimeout(() => {
      this.filterForm.get(controlName).value ? this.isBucketActive = true : this.isBucketActive = false;
      this.faultParams = this.faultParams.delete('fpm');
      this.fpm = this.bucketFpm;
      if (this.filterForm.get('repairCheckbox').value) {
        let statusArray = Object.values(FAULT_STATUSES);
        this.fs = statusArray.filter(status => status != FAULT_STATUSES.CANCELLED && status != FAULT_STATUSES.CLOSED);
        this.showEscalated = 'false';
      }

      if (this.filterForm.get('newRepairs').value) {
        this.fs.push(1);
        this.showEscalated = 'false';
      }

      if (this.filterForm.get('emergency').value) {
        this.fs.push(FAULT_STATUSES.REPORTED);
        this.fus.push(URGENCY_TYPES.EMERGENCY);
        this.showEscalated = 'false';
      }

      if (this.filterForm.get('urgent').value) {
        this.fs.push(FAULT_STATUSES.REPORTED);
        this.fus.push(URGENCY_TYPES.URGENT);
        this.showEscalated = 'false';
      }

      if (this.filterForm.get('nonUrgent').value) {
        this.fs.push(FAULT_STATUSES.REPORTED);
        this.fus.push(URGENCY_TYPES.NON_URGENT);
        this.showEscalated = 'false';
      }

      if (this.filterForm.get('assessment').value) {
        this.fs.push(FAULT_STATUSES.IN_ASSESSMENT, FAULT_STATUSES.CHECKING_LANDLORD_INSTRUCTIONS);
        this.showEscalated = 'false';
      }

      if (this.filterForm.get('automation').value) {
        this.fs.push(FAULT_STATUSES.QUOTE_REQUESTED, FAULT_STATUSES.QUOTE_RECEIVED, FAULT_STATUSES.QUOTE_PENDING, FAULT_STATUSES.QUOTE_APPROVED, FAULT_STATUSES.QUOTE_REJECTED,
          FAULT_STATUSES.WORKSORDER_PENDING, FAULT_STATUSES.AWAITING_JOB_COMPLETION,
          FAULT_STATUSES.WORKSORDER_RAISED, FAULT_STATUSES.AWAITING_RESPONSE_CONTRACTOR, FAULT_STATUSES.WORK_INPROGRESS, FAULT_STATUSES.WORK_COMPLETED, FAULT_STATUSES.AWAITING_RESPONSE_LANDLORD, FAULT_STATUSES.AWAITING_RESPONSE_TENANT, FAULT_STATUSES.AWAITING_RESPONSE_THIRD_PARTY);
        this.showEscalated = 'false';
      }

      if (this.filterForm.get('invoice').value) {
        this.fs.push(FAULT_STATUSES.INVOICE_SUBMITTED, FAULT_STATUSES.INVOICE_APPROVED);
        this.showEscalated = 'false';
      }
      if (this.filterForm.get('escalation').value) {
        this.showEscalated = 'true';
      }

      const filteredStatus: any = [];
      this.fs.filter((elem) =>
        this.faultStatuses.find((e) => {
          if (elem === e.index) {
            filteredStatus.push(e);
          }
        })
      );

      this.filterForm.get('statusFilter').setValue(filteredStatus);
      this.filterList();
    }, 200)
  }

  async onStatusChange() {
    this.isFilter = true;
    this.fs = [];
    if (this.filterForm.get('statusFilter').value) {
      for (var val of this.filterForm.get('statusFilter').value) {
        this.fs.push(val.index);
      }
    }
    this.filterList();
  }

  async onUserChange() {
    this.isFilter = true;
    this.fat = [];
    if (this.filterForm.get('assignToFilter').value) {
      for (var val of this.filterForm.get('assignToFilter').value) {
        this.fat.push(val.userId);
      }
    }
    this.filterList();
  }

  async onBranchChange() {
    if (this.filterForm.get('branchfilter').value) {
      this.isFilter = true;
      this.fpo = [];
      if (this.filterForm.get('branchfilter').value) {
        for (var val of this.filterForm.get('branchfilter').value) {
          this.fpo.push(val.officeCode);
        }
      }
      this.filterList();
    }
  }

  async onMgmtTypeChange() {
    this.isFilter = true;
    this.fpm = [];
    if (this.filterForm.get('managementFilter').value) {
      for (var val of this.filterForm.get('managementFilter').value) {
        this.fpm.push(val.index);
      }
    }
    this.filterList();
  }

  filterList() {
    this.faultParams = this.faultParams.delete('fs');
    this.faultParams = this.faultParams.delete('fat');
    this.faultParams = this.faultParams.delete('fpo');
    this.faultParams = this.faultParams.delete('fpm');
    this.faultParams = this.faultParams.delete('fcfd');
    this.faultParams = this.faultParams.delete('fctd');
    this.faultParams = this.faultParams.delete('fus');
    this.faultParams = this.faultParams.delete('showEscalated');
    this.faultParams = this.faultParams.delete('searchKey');
    this.faultParams = this.faultParams.delete('showMyRepairs');
    this.faultParams = this.faultParams.delete('snoozeUntil');

    if (this.fat.length > 0) {
      this.faultParams = this.faultParams.set('fat', this.fat.toString());
    }
    if (this.fpo.length > 0) {
      this.faultParams = this.faultParams.set('fpo', this.fpo.toString());
    }
    if (this.fpm.length > 0) {
      this.faultParams = this.faultParams.set('fpm', this.fpm.toString());
    }
    if (this.fcfd) {
      this.faultParams = this.faultParams.set('fcfd', this.fcfd);
    }
    if (this.fctd) {
      this.faultParams = this.faultParams.set('fctd', this.fctd);
    }
    if (this.fus.length > 0) {
      let unique = this.fus.filter((v, i, a) => a.indexOf(v) === i);
      this.faultParams = this.faultParams.set('fus', unique.toString());
    }
    if (this.fs.length > 0) {
      let unique = this.fs.filter((v, i, a) => a.indexOf(v) === i);
      this.faultParams = this.faultParams.set('fs', unique.toString());
    }
    if (this.showEscalated.length > 0) {
      this.faultParams = this.faultParams.set('showEscalated', this.showEscalated);
    }
    if (this.searchKey.value && this.searchKey.value.length >= 3) {
      this.faultParams = this.faultParams.set('searchKey', this.searchKey.value.toString());
    }

    if (this.filterForm.value.showMyRepairs) {
      this.faultParams = this.faultParams.set('showMyRepairs', true);

    }
    if (this.filterForm.value.snoozeUntil) {
      let date = this.datepipe.transform(this.filterForm.value.snoozeUntil, 'yyyy-MM-dd');
      this.faultParams = this.faultParams.set('snoozeUntil', date);
    }
    this.rerenderFaults();
    this.bucketCount();
  }

  getMoreUsers(event: {
    component: IonicSelectableComponent,
    text: string
  }) {
    if (event) {
      let text = (event.text || '').trim().toLowerCase();

      this.getUsersAsync(this.page, 10).subscribe(users => {
        users = event.component.items.concat(users);

        if (text) {
          users = this.filterUsers(users, text);
        }

        event.component.items = users;
        event.component.endInfiniteScroll();
        this.page++;
      });
    }

  }

  getUsers(page?: number, size?: number) {
    let users = [];

    this.userList.forEach(user => {
      users.push(user);
    });

    if (page && size) {
      users = this.userList.slice((page - 1) * size, ((page - 1) * size) + size);
    }

    return users;
  }

  getUsersAsync(page?: number, size?: number, timeout = 2000): Observable<AssignedUsers[]> {
    return new Observable<AssignedUsers[]>(observer => {
      observer.next(this.getUsers(page, size));
      observer.complete();
    }).pipe(delay(timeout));
  }

  filterUsers(users: AssignedUsers[], text: string) {
    return users.filter(user => {
      return user.name.toLowerCase().indexOf(text) !== -1
    });
  }


  searchUsers(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    // Close any running subscription.
    if (this.assignToSubscription) {
      this.assignToSubscription.unsubscribe();
    }

    if (!text) {
      // Close any running subscription.
      if (this.assignToSubscription) {
        this.assignToSubscription.unsubscribe();
      }

      event.component.items = this.getUsers(1, 15);

      // Enable and start infinite scroll from the beginning.
      this.page = 2;
      event.component.endSearch();
      event.component.enableInfiniteScroll();
      return;
    }

    this.assignToSubscription = this
      .getUsersAsync()
      .subscribe(ports => {
        // Subscription will be closed when unsubscribed manually.
        if (this.assignToSubscription.closed) {
          return;
        }

        event.component.items = this.filterUsers(ports, text);
        event.component.endSearch();
      });
  }

  onDateChange() {
    if (this.filterForm.get('fromDate').value) {
      this.fcfd = this.filterForm.get('fromDate').value ? this.datepipe.transform(this.filterForm.get('fromDate').value, 'yyyy-MM-dd') : '';
    }

    if (this.filterForm.get('toDate').value) {
      this.fctd = this.filterForm.get('toDate').value ? this.datepipe.transform(this.filterForm.get('toDate').value, 'yyyy-MM-dd') : '';
    }

    this.filterList();
  }

  clickCheckbox(controlName) {
    this.checkboxClick(controlName);
    if (this.filterForm.get(controlName).value) {
      this.filterForm.get(controlName).setValue(!this.filterForm.get(controlName).value);
      return;
    }
    this.filterForm.get(controlName).setValue(true);
  }

  beginLoading() {
    this.commonService.showLoader();
  }

  endLoading() {
    this.commonService.hideLoader();
  }

  startLoading() { }

  selectFault(faultDetail, event) {
    if (event.target.checked && this.validateFaults(faultDetail) && this.checkMaintenance(faultDetail, event)) {
      faultDetail.isChecked = true;
      this.selectedFaultList.push(faultDetail);
    }
    else {
      event.target.checked = false;
      faultDetail.isChecked = false;
      this.selectedFaultList.forEach((element, index) => {
        if (element.faultId == faultDetail.faultId) this.selectedFaultList.splice(index, 1);
      });
    }
  }

  validateFaults(faultDetail) {
    let valid = true;
    if (faultDetail.status === FAULT_STATUSES.CLOSED) {
      this.commonService.showAlert('Repair Closed', 'Repair status is closed, Please select another repair.', '');
      return valid = false;
    }
    if (this.selectedFaultList.length === 3) {
      this.commonService.showAlert('Maximum Limit', 'Maximum allowed limit to merge repair is 3.', '');
      return valid = false;
    }
    if (this.selectedFaultList.length > 0) {
      let matchedProperty = this.selectedFaultList.filter(data => data.propertyId === faultDetail.propertyId);
      if (matchedProperty.length === 0) {
        this.commonService.showAlert('Property not matched', 'You can only merge repairs that are reported for the same property.', '');
        return valid = false;
      }
    }
    return valid;
  }

  async checkMaintenance(faultDetail, event) {
    let valid = true;
    const data = await this.getFaultMaintenance(faultDetail.faultId);
    if (data) {
      event.target.checked = false;
      faultDetail.isChecked = false;
      event.stopPropagation();
      this.commonService.showAlert('Quote/Works Order Raised', 'There is active maintenance linked with this repair, cannot be selected to merge.', '');
      return valid = false;
    }
    return valid;
  }

  selectCheckedFault() {
    if (this.selectedFaultList && this.selectedFaultList.length > 0) {
      for (let i = 0; i < this.faultList.length; i++) {
        this.faultList[i].isChecked = this.selectedFaultList.find(data => data.faultId === this.faultList[i].faultId)
      }
    }
  }

  async mergeFault(data) {
    const isConfirm = await this.commonService.showConfirm('Merge Repairs', `You have selected ${this.selectedFaultList?.length} repairs to merge. Information from all the repairs will be copied into the Repair ${data?.reference} and the remaining repairs will be marked as Closed. Any communications sent out from the repairs being closed will be voided. Are you sure?`)
    if (isConfirm && data) {
      let childFaults = this.selectedFaultList.filter(x => x.faultId != data.faultId);
      let requestObj: any = {};
      requestObj.childFaults = childFaults.map(x => x.faultId);
      this.faultsService.mergeFaults(requestObj, data.faultId).subscribe(response => {
        this.hideMenu('', 'divOverlay');
        this.selectedFaultList = [];
        this.filterList();
      });
    }
  }

  async getFaultMaintenance(faultId) {
    const promise = new Promise((resolve, reject) => {
      const params: any = new HttpParams().set('showCancelled', 'false');
      this.faultsService.getQuoteDetails(faultId, params).subscribe((res) => {
        resolve(res ? res.data[0] : false);
      }, error => {
        resolve(false);
      });
    });
    return promise;
  }

  bucketCount() {

    this.getActiveRepairCount();
    this.getEmergencyCount();
    this.getUrgentCount();
    this.getNonUrgentCount();
    this.getAssismentCount();
    this.getAutomationCount();
    this.getInvoiceCount();
    this.getEscalationCount();

  }

  getActiveRepairCount() {
    let statusArray = Object.values(FAULT_STATUSES);
    let fs = statusArray.filter(status => status != FAULT_STATUSES.CANCELLED && status != FAULT_STATUSES.CLOSED);

    let faultCountParams: any = this.faultParams
      .set('fs', fs.toString())
      .set('showEscalated', 'false')
      .set('fpm', this.fpm.toString())
      .set('hideLoader', 'true');
    faultCountParams = faultCountParams.delete('page');
    faultCountParams = faultCountParams.delete('limit');
    faultCountParams = faultCountParams.delete('fus');
    this.activeRepairLoader = true;
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getFaultCounts(faultCountParams).subscribe((res) => {
        this.activeRepairLoader = false;
        this.activeRepairCount = res ? res.count : 0;
        resolve(true);
      }, error => {
        this.activeRepairLoader = false;
        resolve(false);
      });
    });
    return promise;
  }

  getEmergencyCount() {
    let faultCountParams: any = this.faultParams
      .set('fs', FAULT_STATUSES.REPORTED.toString())
      .set('fus', URGENCY_TYPES.EMERGENCY.toString())
      .set('showEscalated', 'false')
      .set('fpm', this.fpm.toString())
      .set('hideLoader', 'true');
    faultCountParams = faultCountParams.delete('page');
    faultCountParams = faultCountParams.delete('limit');
    this.emergencyLoader = true;
    new Promise((resolve, reject) => {
      this.faultsService.getFaultCounts(faultCountParams).subscribe((res) => {
        this.emergencyLoader = false;
        this.emergencyCount = res ? res.count : 0;
        resolve(true);
      }, error => {
        this.emergencyLoader = false;
        resolve(false);
      });
    });
  }

  getUrgentCount() {
    let faultCountParams: any = this.faultParams
      .set('fs', FAULT_STATUSES.REPORTED.toString())
      .set('fus', URGENCY_TYPES.URGENT.toString())
      .set('showEscalated', 'false')
      .set('fpm', this.fpm.toString())
      .set('hideLoader', 'true');
    faultCountParams = faultCountParams.delete('page');
    faultCountParams = faultCountParams.delete('limit');
    this.urgentLoader = true;
    new Promise((resolve, reject) => {
      this.faultsService.getFaultCounts(faultCountParams).subscribe((res) => {
        this.urgentLoader = false;
        this.urgentCount = res ? res.count : 0;
        resolve(true);
      }, error => {
        this.urgentLoader = false;
        resolve(false);
      });
    });
  }

  getNonUrgentCount() {
    let faultCountParams: any = this.faultParams
      .set('fs', FAULT_STATUSES.REPORTED.toString())
      .set('fus', URGENCY_TYPES.NON_URGENT.toString())
      .set('showEscalated', 'false')
      .set('fpm', this.fpm.toString())
      .set('hideLoader', 'true');
    faultCountParams = faultCountParams.delete('page');
    faultCountParams = faultCountParams.delete('limit');
    this.nonUrgentLoader = true;
    new Promise((resolve, reject) => {
      this.faultsService.getFaultCounts(faultCountParams).subscribe((res) => {
        this.nonUrgentLoader = false;
        this.nonUrgentCount = res ? res.count : 0;
        resolve(true);
      }, error => {
        this.nonUrgentLoader = false;
        resolve(false);
      });
    });
  }

  getAssismentCount() {
    let fs = [FAULT_STATUSES.IN_ASSESSMENT, FAULT_STATUSES.CHECKING_LANDLORD_INSTRUCTIONS]
    let faultCountParams: any = this.faultParams
      .set('fs', fs.toString())
      .set('showEscalated', 'false')
      .set('fpm', this.fpm.toString())
      .set('hideLoader', 'true');
    faultCountParams = faultCountParams.delete('page');
    faultCountParams = faultCountParams.delete('limit');
    faultCountParams = faultCountParams.delete('fus');
    this.assismentLoader = true;
    new Promise((resolve, reject) => {
      this.faultsService.getFaultCounts(faultCountParams).subscribe((res) => {
        this.assismentLoader = false;
        this.assismentCount = res ? res.count : 0;
        resolve(true);
      }, error => {
        this.assismentLoader = false;
        resolve(false);
      });
    });
  }

  getAutomationCount() {
    let fs = [FAULT_STATUSES.QUOTE_REQUESTED, FAULT_STATUSES.QUOTE_RECEIVED, FAULT_STATUSES.QUOTE_PENDING, FAULT_STATUSES.QUOTE_APPROVED, FAULT_STATUSES.QUOTE_REJECTED,
    FAULT_STATUSES.WORKSORDER_PENDING, FAULT_STATUSES.AWAITING_JOB_COMPLETION,
    FAULT_STATUSES.WORKSORDER_RAISED, FAULT_STATUSES.AWAITING_RESPONSE_CONTRACTOR, FAULT_STATUSES.WORK_INPROGRESS, FAULT_STATUSES.WORK_COMPLETED, FAULT_STATUSES.AWAITING_RESPONSE_LANDLORD, FAULT_STATUSES.AWAITING_RESPONSE_TENANT, FAULT_STATUSES.AWAITING_RESPONSE_THIRD_PARTY]
    let faultCountParams: any = this.faultParams
      .set('fs', fs.toString())
      .set('showEscalated', 'false')
      .set('fpm', this.fpm.toString())
      .set('hideLoader', 'true');
    faultCountParams = faultCountParams.delete('page');
    faultCountParams = faultCountParams.delete('limit');
    faultCountParams = faultCountParams.delete('fus');
    this.automationLoader = true;
    new Promise((resolve, reject) => {
      this.faultsService.getFaultCounts(faultCountParams).subscribe((res) => {
        this.automationLoader = false;
        this.automationCount = res ? res.count : 0;
        resolve(true);
      }, error => {
        this.automationLoader = false;
        resolve(false);
      });
    });
  }

  getInvoiceCount() {
    let fs = [FAULT_STATUSES.INVOICE_SUBMITTED, FAULT_STATUSES.INVOICE_APPROVED]
    let faultCountParams: any = this.faultParams
      .set('fs', fs.toString())
      .set('showEscalated', 'false')
      .set('fpm', this.fpm.toString())
      .set('hideLoader', 'true');
    faultCountParams = faultCountParams.delete('page');
    faultCountParams = faultCountParams.delete('limit');
    faultCountParams = faultCountParams.delete('fus');
    this.invoiceLoader = true;
    new Promise((resolve, reject) => {
      this.faultsService.getFaultCounts(faultCountParams).subscribe((res) => {
        this.invoiceLoader = false;
        this.invoiceCount = res ? res.count : 0;
        resolve(true);
      }, error => {
        this.invoiceLoader = false;
        resolve(false);
      });
    });
  }

  getEscalationCount() {
    let faultCountParams: any = this.faultParams
      .set('showEscalated', 'true')
      .set('fpm', this.fpm.toString())
      .set('hideLoader', 'true');
    faultCountParams = faultCountParams.delete('fs');
    faultCountParams = faultCountParams.delete('page');
    faultCountParams = faultCountParams.delete('limit');
    faultCountParams = faultCountParams.delete('fus');
    this.escalationLoader = true;
    new Promise((resolve, reject) => {
      this.faultsService.getFaultCounts(faultCountParams).subscribe((res) => {
        this.escalationLoader = false;
        this.escalationCount = res ? res.count : 0;
        resolve(true);
      }, error => {
        this.escalationLoader = false;
        resolve(false);
      });
    });
  }

  setSnoozeMinMaxDate() {
    const currentDate = new Date();
    this.minDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() + 1), 'yyyy-MM-dd');
    this.futureDate = this.commonService.getFormatedDate(currentDate.setDate(currentDate.getDate() + 29), 'yyyy-MM-dd');
    this.currentDate = this.commonService.getFormatedDate(new Date(), 'yyyy-MM-dd');
  }
}

export class AssignedUsers {
  email: string
  name: string
  officeCode: string
  telephone1: string
  telephone2: string
  telephone3: string
  userId: string
}
