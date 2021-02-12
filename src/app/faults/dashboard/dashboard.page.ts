import { HttpParams } from '@angular/common/http';
import { PROPCO, REPORTED_BY_TYPES } from './../../shared/constants';
import { CommonService } from './../../shared/services/common.service';
import { FaultsService } from './../faults.service';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NotesModalPage } from '../../shared/modals/notes-modal/notes-modal.page';
import { EscalateModalPage } from '../../shared/modals/escalate-modal/escalate-modal.page';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { IonicSelectableComponent } from 'ionic-selectable';
import { delay } from 'rxjs/operators';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;

  dtOptions: DataTables.Settings[] = [];
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
  invoiceArr = [{ key: 8, value: 'Invoice Submitted' }, { key: 9, value: 'Paid' }];
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

  constructor(
    private commonService: CommonService,
    private modalController: ModalController,
    private router: Router,
    private faultsService: FaultsService,
    private fb: FormBuilder,
    public datepipe: DatePipe,
  ) {
    this.getLookupData();
  }

  ngOnInit(): void {
    this.dtOptions[1] = this.buildDtOptions();
    const that = this;
    this.dtOptions[0] = {
      paging: true,
      pagingType: 'full_numbers',
      serverSide: true,
      processing: true,
      searching: false,
      ordering: false,
      pageLength: 5,
      lengthMenu: [5, 10, 15],
      ajax: (tableParams: any, callback) => {
        this.faultParams = this.faultParams
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1');
        // if (this.fpm.length > 0) {
        // this.faultParams = this.faultParams.set('fpm', '17,18,20,24,27,32,35,36');
        // }
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
      }
    };

    setTimeout(() => {
      this.notesDtTrigger.next();
    }, 1000);

    this.initFilterForm();
    this.getMgntServiceType();
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
    });
  }

  ionViewDidEnter() {
    this.faultParams = this.faultParams.set('fpm', '17,18,20,24,27,32,35,36');
    this.rerenderFaults(true);
    this.hideMenu('', 'divOverlay');
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
    this.faultStatuses = data.faultStatuses;
    this.faultUrgencyStatuses = data.faultUrgencyStatuses;
  }

  getLookupValue(index, lookup, type?) {
    index = (type == 'category' && index) ? Number(index) : index;
    return this.commonService.getLookupValue(index, lookup);
  }

  onClickRow(data, index?) {
    return
    this.selectedData = data;
    this.getFaultNotes(this.selectedData.faultId);
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
    this.router.navigate(['faults/add']);
  }

  async notesModal() {
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container',
      componentProps: {
        notesType: 'fault',
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
    const headingText = 'Escalate Fault';
    const modal = await this.modalController.create({
      component: EscalateModalPage,
      cssClass: 'modal-container',
      componentProps: {
        heading: headingText,
        faultId: this.selectedData.faultId
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data == 'success') {
        this.commonService.showAlert('Escalate Fault', 'Fault has been escalated to the property manager.');
        this.rerenderFaults(false);
        this.getFaultNotes(this.selectedData.faultId);
        this.hideMenu('', 'divOverlay');
      }
    });
    await modal.present();
  }

  async deEscalateFault() {
    this.commonService.showConfirm('De-Escalate Fault', 'Are you sure, you want to de-escalate the fault?', '', 'Yes', 'No').then(res => {
      if (res) {
        this.faultsService.deEscalateFault(this.selectedData.faultId, {}).subscribe(res => {
          this.commonService.showAlert('De-Escalate Fault', 'Fault has been de-escalated to the property manager.');
          this.rerenderFaults(false);
          this.hideMenu('', 'divOverlay');
        }, error => {
          // this.commonService.showMessage();
        });
      }
    })
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
    this.router.navigate([`faults/${this.selectedData.faultId}/details`]);
  }

  getaccessibleOffices() {
    this.faultsService.getaccessibleOffices().subscribe(res => {
      this.accessibleOffices = res && res.data ? res.data : [];
    });
  }

  getMgntServiceType() {
    this.faultsService.getManagementTypes().subscribe(res => {
      this.managementTypeList = res ? res : [];
      if (this.managementTypeList) {
        for (var val of this.managementTypeList) {
          if (val.letCategory === 3346) {
            this.fpm.push(val.index);
            this.selectedMgmtType.push(val)
          }
        }
        this.filterForm.get('managementFilter').setValue(this.selectedMgmtType);
      }
    });
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
      this.isManagementFilter = true;
    }

    if (this.filterValue == 3) {
      this.isStatusFilter = true;
    }

    if (this.filterValue == 4) {
      this.getAssignedUsers();
      this.isAssignToFilter = true;
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

    this.filterForm.get('filterType').reset();
    this.getList();

  }

  resetFilter() {
    this.isFilter = false;
    this.filterForm.reset();
    this.isBranchFilter = false;
    this.isManagementFilter = false;
    this.isStatusFilter = false;
    this.isAssignToFilter = false;
    this.faultParams = new HttpParams().set('limit', '5').set('page', '1').set('fpm', '17,18,20,24,27,32,35,36');
    this.rerenderFaults();
    this.fs = [];
    this.fcfd = '';
    this.fctd = '';
    this.filterForm.get('managementFilter').setValue(this.selectedMgmtType);
  }

  async checkboxClick(controlName?) {
    this.isFilter = true;
    this.fs = [];
    this.fus = [];
    let checkBoxControls = ['repairCheckbox', 'newRepairs', 'emergency', 'urgent', 'nonUrgent', 'assessment', 'automation', 'invoice', 'escalation']

    if (controlName) {
      checkBoxControls.forEach(key => {
        if (this.filterForm.get(controlName).value && controlName !== key) {
          this.filterForm.get(key).setValue(false);
        }
      });
    }

    if (this.filterForm.get('repairCheckbox').value) {
      this.fs.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21);
    }

    if (this.filterForm.get('newRepairs').value) {
      this.fs.push(1);
    }

    if (this.filterForm.get('emergency').value) {
      // this.fs.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21);
      this.fs.push(1);
      this.fus.push(1);
    }

    if (this.filterForm.get('urgent').value) {
      this.fs.push(1);
      this.fus.push(2);
    }

    if (this.filterForm.get('nonUrgent').value) {
      this.fs.push(1);
      this.fus.push(3);
    }

    if (this.filterForm.get('assessment').value) {
      this.fs.push(2, 13);
    }

    if (this.filterForm.get('automation').value) {
      this.fs.push(3, 4, 5, 6, 7, 14, 15, 16, 17, 18, 19, 20, 21);
    }

    if (this.filterForm.get('invoice').value) {
      let response: any = await this.commonService.showCheckBoxConfirm("Invoice Type", 'Apply', 'Cancel', this.createInputs());
      if (response && response.length > 0) {
        this.fs.push(response);
      } else {
        this.filterForm.get('invoice').setValue(false)
        return;
      }
    }

    if (this.filterForm.get('escalation').value) {
      this.fs.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21);
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
    this.getList();
  }

  async onStatusChange() {
    this.isFilter = true;
    this.fs = [];
    if (this.filterForm.get('statusFilter').value) {
      for (var val of this.filterForm.get('statusFilter').value) {
        this.fs.push(val.index);
      }
    }
    this.getList();
  }

  async onUserChange() {
    this.isFilter = true;
    this.fat = [];
    if (this.filterForm.get('assignToFilter').value) {
      for (var val of this.filterForm.get('assignToFilter').value) {
        this.fat.push(val.userId);
      }
    }
    this.getList();
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
      this.getList();
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
    this.getList();
  }

  getList() {
    this.faultParams = this.faultParams.delete('fs');
    this.faultParams = this.faultParams.delete('fat');
    this.faultParams = this.faultParams.delete('fpo');
    this.faultParams = this.faultParams.delete('fpm');
    this.faultParams = this.faultParams.delete('fcfd');
    this.faultParams = this.faultParams.delete('fctd');
    this.faultParams = this.faultParams.delete('fus');

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
      this.faultParams = this.faultParams.set('fus', this.fus.toString());
    }
    if (this.fs.length > 0) {
      let unique = this.fs.filter((v, i, a) => a.indexOf(v) === i);
      this.faultParams = this.faultParams.set('fs', unique.toString());
    }
    this.rerenderFaults();
  }

  createInputs() {
    const theNewInputs = [];
    for (let i = 0; i < this.invoiceArr.length; i++) {
      theNewInputs.push(
        {
          type: 'checkbox',
          label: this.invoiceArr[i].value,
          value: '' + this.invoiceArr[i].key,
          checked: false
        }
      );
    }
    return theNewInputs;
  }

  getMoreUsers(event: {
    component: IonicSelectableComponent,
    text: string
  }) {
    if (event) {
      let text = (event.text || '').trim().toLowerCase();

      // if (this.page > 3) {
      //   event.component.disableInfiniteScroll();
      //   return;
      // }

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

    this.getList();
  }

  clickCheckbox(controlName) {
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
    if (faultDetail.status === 12) {
      this.commonService.showAlert('Fault Closed', 'Fault status is closed, Please select another fault', '');
      return valid = false;
    }
    if (this.selectedFaultList.length === 3) {
      this.commonService.showAlert('Maximum Limit', 'Maximum fault merge limit is 3', '');
      return valid = false;
    }
    if (this.selectedFaultList.length > 0) {
      let matchedProperty = this.selectedFaultList.filter(data => data.propertyId === faultDetail.propertyId);
      if (matchedProperty.length === 0) {
        this.commonService.showAlert('Property not matched', 'Please select same property faults', '');
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
      this.commonService.showAlert('Quote/Works Order', 'Quote or Works Order raised faults can not be merged', '');
      return valid = false;
    }
    return valid;
  }

  selectCheckedFault() {
    if (this.selectedFaultList.length > 0) {
      for (let i = 0; i < this.faultList.length; i++) {
        this.faultList[i].isChecked = this.selectedFaultList.find(data => data.faultId === this.faultList[i].faultId)
      }
    }
  }

  mergeFault(faultId) {
    if (faultId) {
      let childFaults = this.selectedFaultList.filter(x => x.faultId != faultId);
      let requestObj: any = {};
      requestObj.childFaults = childFaults.map(x => x.faultId);
      this.faultsService.mergeFaults(requestObj, faultId).subscribe(response => {
        this.getList();
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
