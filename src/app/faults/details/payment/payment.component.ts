import { RejectInvoiceComponent } from './../../../shared/modals/reject-invoice/reject-invoice.component';
import { WorksorderModalPage } from 'src/app/shared/modals/worksorder-modal/worksorder-modal.page';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, delay, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES, ACCESS_INFO_TYPES, MAINTENANCE_TYPES, LL_INSTRUCTION_TYPES, FAULT_QUALIFICATION_ACTIONS, KEYS_LOCATIONS, FILE_IDS, MAINT_CONTACT, FAULT_NOTIFICATION_STATE } from './../../../shared/constants';
import { ModalController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DatePipe } from '@angular/common';
import { CloseFaultModalPage } from 'src/app/shared/modals/close-fault-modal/close-fault-modal.page';
import { PendingNotificationModalPage } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.page';
import { AddressPipe } from 'src/app/shared/pipes/address-string-pipe.pipe';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss', '../details.page.scss'],
})
export class PaymentComponent implements OnInit {

  workOrderForm: FormGroup;
  addContractorForm: FormGroup;
  contractorListForm: FormGroup;
  userSelectedActionControl = new FormControl();
  @Input() faultDetails: FaultModels.IFaultResponse;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  @Input() quoteDocuments: any;
  @Input() propertyDetails;
  @Input() categoryName;
  faultMaintenanceDetails: FaultModels.IMaintenanceQuoteResponse;
  contractors: Observable<FaultModels.IContractorResponse>;
  resultsAvailable = false;
  contractorList: any;
  lookupdata: any;
  contractorSkill: any;
  faultCategories: any;
  categoryMap = new Map();
  isSelected = false;
  contratctorArr: string[] = [];
  isContratorSelected = false;
  iacNotification;
  iacStageActions = LL_INSTRUCTION_TYPES;
  otherStageActions = LL_INSTRUCTION_TYPES.filter(action => { return (action.index == 'OBTAIN_QUOTE' || action.index == 'PROCEED_WITH_WORKSORDER') });

  accessInfoList = ACCESS_INFO_TYPES;
  isMaintenanceDetails = false;
  nominalCodes;
  quoteStatuses;
  rejectionReason: string = null;
  restrictAction: boolean = false;
  isUserActionChange: boolean = false;
  faultMaintRejectionReasons: any;
  woResultsAvailable = false;
  woContractors: Observable<FaultModels.IContractorResponse>;
  nominalCodeSubscription: Subscription;
  page = 2;
  codes: FaultModels.NominalCode[];
  currentDate = this.commonService.getFormatedDate(new Date());
  isWorksOrder: boolean = false;
  isFormsReady: boolean = false;
  INVOICE_VERIFICATION_THRESHOLD = 0;
  faultQualificationsAction = FAULT_QUALIFICATION_ACTIONS;
  pendingNotification: any;
  showSkeleton: boolean = true;
  saving: boolean = false;
  fileIds = FILE_IDS;
  notificationState = FAULT_NOTIFICATION_STATE;

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private commonService: CommonService,
    private modalController: ModalController,
    public datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.initiatePayment();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.faultDetails && !changes.faultDetails.firstChange) {
      this.showSkeleton = true;
      this.initiatePayment();
    }
  }

  private async initiatePayment() {
    this.faultMaintenanceDetails = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (this.faultDetails.status === 19 || (this.faultMaintenanceDetails && this.faultMaintenanceDetails.itemType === MAINTENANCE_TYPES.WORKS_ORDER)) {
      /*19: Worksorder Pending*/
      this.isWorksOrder = true;
    }
    this.showSkeleton = false
  }

  private initForms(): void {
    this.initWorkOrderForms();
    this.isFormsReady = true;
  }

  private initWorkOrderForms(): void {
    this.workOrderForm = this.fb.group({
      propertyId: [this.faultDetails.propertyId, Validators.required],
      contractorId: ['', Validators.required],
      contractorName: ['', Validators.required],
      company: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      repairCost: [this.faultDetails.confirmedEstimate, Validators.required],
      worksOrderNumber: [{ value: this.faultDetails.reference, disabled: true }],
      postdate: [{ value: '', disabled: true }],
      nominalCode: ['', Validators.required],
      description: [this.categoryName + ' ' + this.faultDetails.title, Validators.required],
      paidBy: [{ value: 'LANDLORD', disabled: true }, Validators.required],
      keysLocation: this.faultDetails.doesBranchHoldKeys ? KEYS_LOCATIONS.KEY_IN_BRANCH : KEYS_LOCATIONS.DO_NOT_HOLD_KEY,
      returnKeysTo: this.faultDetails.doesBranchHoldKeys ? 'Return to Branch' : '',
      accessDetails: [this.getAccessDetails(this.faultDetails.isTenantPresenceRequired), Validators.required],
      requiredDate: '',
      fullDescription: [this.faultDetails.notes, Validators.required],
      orderedBy: { value: '', disabled: true },
      agentReference: [{ value: '', disabled: true }],
      defaultCommissionPercentage: [{ value: '', disabled: true }],
      defaultCommissionAmount: [{ value: '', disabled: true }],
      businessTelephone: [{ value: '', disabled: true }],
    });
    if (this.faultDetails.doesBranchHoldKeys) {
      this.officeDetails();
    }
    if (!this.faultMaintenanceDetails && this.faultDetails.contractorId) {
      this.woSelectContractor(this.faultDetails.contractorId);
    }
    this.woContractors = this.workOrderForm.get('contractorName').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultsService.searchContractor(value) :
        new Observable())
    );
  }

  private getAccessDetails(tenantPresence): string {
    return (tenantPresence ? MAINT_CONTACT.CONTACT_TENANT : MAINT_CONTACT.ACCESS_VIA_KEY);
  }




  private async initApiCalls() {
    if (this.faultMaintenanceDetails) {
      if (this.faultDetails.status === 8) {
        this.INVOICE_VERIFICATION_THRESHOLD = await this.getSystemOptions() as number;
      }
      this.initPatching();
    }
    await this.faultNotification(this.faultDetails.stageAction);
    this.showSkeleton = false;
  }

  private getFaultMaintenance() {
    return new Promise((resolve) => {
      const params: any = new HttpParams().set('showCancelled', 'true');
      this.faultsService.getQuoteDetails(this.faultDetails.faultId, params).subscribe((res) => {
        this.isMaintenanceDetails = true;
        resolve(res ? res.data[0] : {});
      }, error => {
        this.commonService.showMessage('Something went wrong', 'Arranging Contractor', 'error');
        resolve(false);
      });
    });
    
  }

  initPatching(): void {
    if (this.isWorksOrder) {
      this.workOrderForm.patchValue(
        {
          worksOrderNumber: this.faultMaintenanceDetails.worksOrderNumber,
          description: this.faultMaintenanceDetails.description,
          orderedBy: this.faultMaintenanceDetails.orderedBy,
          postdate: this.faultMaintenanceDetails.postdate,
          accessDetails: this.faultMaintenanceDetails.accessDetails,
          contractorId: this.faultMaintenanceDetails.contractorId,
          nominalCode: this.faultMaintenanceDetails.nominalCode,
          fullDescription: this.faultMaintenanceDetails.fullDescription,
          repairCost: this.faultMaintenanceDetails.amount,
          keysLocation: this.faultMaintenanceDetails.keysLocation,
          requiredDate: this.faultMaintenanceDetails.requiredCompletionDate,
          returnKeysTo: this.faultMaintenanceDetails.returnKeysTo
        }
      );
      this.workOrderForm.get('contractorName').disable();
      this.woSelectContractor(this.faultMaintenanceDetails.contractorId);
    }
  }


  onSearch(event: any) {
    this.isSelected = false;
    this.isContratorSelected = false;
    const searchString = event.target.value;
    if (searchString.length > 2) {
      this.resultsAvailable = true;
    } else {
      this.resultsAvailable = false;
    }
  }

  selectContractor(selected) {
    this.addContractorForm.patchValue({ contractor: selected ? selected.fullName : undefined, contractorObj: selected ? selected : undefined });
    this.resultsAvailable = false;
    this.isSelected = true;
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
    this.contractorSkill = data.contractorSkills;
    this.quoteStatuses = data.maintenanceQuoteStatuses;
  }

  private setFaultsLookupData(data) {
    this.faultCategories = data.faultCategories;
    this.faultMaintRejectionReasons = data.faultMaintRejectionReasons;
    this.setCategoryMap();
  }

  private setCategoryMap() {
    this.faultCategories.map((cat, index) => {
      this.categoryMap.set(cat.index, cat.value);
    });
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  _btnHandler(type: string) {
    switch (type) {
      case 'save': {
        this.saving = true;
        this.saveForLater();
        break;
      }
      default: {
        this.btnAction.emit(type);
        break;
      }
    }
  }

  private async saveForLater() {
    if (this.iacNotification && (this.iacNotification.responseReceived == null || this.iacNotification.responseReceived?.isAccepted == null)) {
      this._btnHandler('saveLater');
      return;
    }
    this.saving = false;
  }
  
  async checkFaultNotifications(faultId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getFaultNotifications(faultId).subscribe(async (response) => {
        let notifications = response && response.data ? response.data : [];
        resolve(notifications);
      }, error => {
        reject(error)
      });
    });
  }

  private filterNotifications(data, stage, action) {
    return new Promise((resolve) => {
      let filtereData = null;
      if (data.length === 0) {
        resolve(null);
      }
      filtereData = data.filter((x => x.faultStage === stage)).filter((x => !x.isVoided));
      if (filtereData.length === 0) {
        resolve(null);
      }
      filtereData = filtereData.sort((a, b) => {
        return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
      });
      if (filtereData && filtereData[0]) {
        this.disableWorksOrderDetail();
        resolve(filtereData[0]);
      } else {
        resolve(null);
      }
    });
    
  }

  private disableWorksOrderDetail() {
    this.workOrderForm.get('worksOrderNumber').disable();
    this.workOrderForm.get('description').disable();
    this.workOrderForm.get('fullDescription').disable();
    this.workOrderForm.get('postdate').disable();
    this.workOrderForm.get('contractorName').disable();
    this.workOrderForm.get('nominalCode').disable();
    this.workOrderForm.get('repairCost').disable();
    this.workOrderForm.get('requiredDate').disable();
    this.workOrderForm.get('keysLocation').disable();
    this.workOrderForm.get('returnKeysTo').disable();
    this.workOrderForm.get('accessDetails').disable();
  }

  setUserAction(index) {
    this.isUserActionChange = true;
    this.userSelectedActionControl.setValue(index);
  }

  async questionAction(data) {
    if ((this.iacNotification && this.iacNotification.responseReceived != null) || this.faultDetails.isClosed) {
      return;
    }

    if (this.iacNotification.templateCode === 'CF-T-E' || this.iacNotification.templateCode === 'LF-T-E' || this.iacNotification.templateCode === 'GNR-T-E' || this.iacNotification.templateCode === 'BMF-T-E' || this.iacNotification.templateCode === 'SMF-T-E') {
      this.questionActionSatisfyJob(data);
    }
    else if (this.iacNotification.templateCode === 'INR-C-E' || this.iacNotification.templateCode === 'IR-C-E') {
      this.questionActionUploadInvoice(data)
    }
  }

  private questionActionSatisfyJob(data) {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isAccepted = data.value;
    notificationObj.submittedByType = 'SECUR_USER';
    if (data.value) {
      let title = (this.iacNotification.templateCode === 'LF-T-E' || this.iacNotification.templateCode === 'GNR-T-E' || this.iacNotification.templateCode === 'BMF-T-E' || this.iacNotification.templateCode === 'SMF-T-E') ? 'Close Repair' : data.text;
      let message = (this.iacNotification.templateCode === 'LF-T-E' || this.iacNotification.templateCode === 'GNR-T-E' || this.iacNotification.templateCode === 'BMF-T-E' || this.iacNotification.templateCode === 'SMF-T-E') ? `This will close the Repair. Are you sure?` : `Are you sure the Tenant is satisfied with the Job?`;
      this.commonService.showConfirm(title, message, '', 'Yes I\'m sure', 'No').then(async res => {
        if (res) {
          this.commonService.showLoader();
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
          this._btnHandler('refresh');
        }
      });
    } else if (!data.value) {
      this.commonService.showConfirm(data.text, `Are you sure the Tenant is not satisfied with the Job?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          this.commonService.showLoader();
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
          this._btnHandler('refresh');
        }
      });
    }
  }

  private async questionActionUploadInvoice(data) {
    if (data.value) {
      this.openWOJobCompletionModal();
    }
  }

  async openWOJobCompletionModal(updateFaultStatus = false) {
    const modal = await this.modalController.create({
      component: WorksorderModalPage,
      cssClass: 'modal-container upload-container fault-modal-container',
      componentProps: {
        faultNotificationId: this.iacNotification.faultNotificationId,
        faultId: this.faultDetails.faultId,
        maintenanceId: this.faultMaintenanceDetails.maintenanceId,
        jobCompletionDate: this.faultMaintenanceDetails.actualCompletionDate,
        isAnyFurtherWork: this.faultDetails.isAnyFurtherWork,
        additionalEstimate: this.faultDetails.additionalEstimate,
        additionalWorkDetails: this.faultDetails.additionalWorkDetail,
        actionType: 'view'
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        let notificationObj = {} as FaultModels.IUpdateNotification;
        notificationObj.isAccepted = true;
        notificationObj.submittedByType = 'SECUR_USER';
        this.commonService.showLoader();
        if (updateFaultStatus) {
          await this.invoiceUploaded();
        } else {
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId)
        }
        this.btnAction.emit('refresh_docs');
      }
    });
    await modal.present();
  }

  private getContractorDetails(contractId, type) {
    return new Promise(() => {
      this.faultsService.getContractorDetails(contractId).subscribe((res) => {
        const data = res ? res : '';
        if (type === 'wo') {
          const filterPipe = new AddressPipe();
          const addressString = filterPipe.transform(data.address);
          this.workOrderForm.patchValue({
            company: data ? data.companyName : undefined, agentReference: data ? data.agentReference : undefined,
            defaultCommissionPercentage: data ? data.defaultCommissionPercentage : undefined,
            defaultCommissionAmount: data ? data.defaultCommissionAmount : undefined,
            businessTelephone: data ? data.businessTelephone : undefined,
            contractorName: data ? data.fullName : undefined, address: addressString,
            contractorId: data ? data.contractorId : undefined
          });
        }
      });
    });
  }

  private async updateFaultNotification(notificationObj, faultNotificationId): Promise<any> {
    return new Promise((resolve) => {
      this.faultsService.updateNotification(faultNotificationId, notificationObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          resolve(false);
        }
      );
    });
  }

  getFileType(name): boolean {
    if (name != null) {
      let data = name.split('.')[1] === 'pdf';
      if (data) {
        return true;
      }
    }
  }

  downloadDocumentByURl(url, name) {
    this.commonService.downloadDocumentByUrl(url, name);
  }

  async deleteDocument(documentId, i: number) {
    const deleteMedia = await this.commonService.showConfirm('Delete Media/Document', 'Do you want to delete the media/document?', '', 'YES', 'NO');
    if (deleteMedia) {
      this.faultsService.deleteDocument(documentId).subscribe(response => {
        this.removeFile(i);
      });
    }
  }

  private removeFile(i) {
    this.quoteDocuments.splice(i, 1);
  }

  async voidNotification(value) {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isVoided = true;
    notificationObj.submittedByType = 'SECUR_USER';
    const updated = await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
    if (updated) {
      let faultRequestObj: any = {};
      faultRequestObj.userSelectedAction = this.userSelectedActionControl.value;
      const isFaultUpdated = await this.updateFaultSummary(faultRequestObj);
      if (isFaultUpdated) {
        if (value) {
          this._btnHandler('cancel');
        }
        else {
          this._btnHandler('refresh');
        }
      }
    }
  }

  updateFaultSummary(faultRequestObj) {
    return new Promise((resolve) => {
      this.faultsService.updateFault(this.faultDetails.faultId, faultRequestObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          resolve(false);
        }
      );
    });
    
  }

  onSearchContractor(event: any) {
    const searchString = event.target.value;
    this.workOrderForm.patchValue({ company: '', address: '', contractorId: '' });
    if (searchString.length > 2) {
      this.woResultsAvailable = true;
    } else {
      this.woResultsAvailable = false;
    }
  }

  woSelectContractor(contractorId) {
    if (contractorId) {
      this.getContractorDetails(contractorId, 'wo');
      this.woResultsAvailable = false;
    }
  }

  getMoreCodes(event: {
    component: IonicSelectableComponent,
    text: string
  }) {
    if (event) {
      const text = (event.text || '').trim().toLowerCase();
      this.getCodesAsync(this.page, 10).subscribe(codes => {
        codes = event.component.items.concat(codes);
        if (text) 
          codes = this.filterCodes(codes, text);
        event.component.items = codes;
        event.component.endInfiniteScroll();
        this.page++;
      });
    }

  }

  getCodes(page?: number, size?: number) {
    let codes = [];
    this.nominalCodes.forEach(code => {
      code.concat = code.nominalCode + ' - ' + code.description;
      if (this.faultMaintenanceDetails?.nominalCode && this.faultMaintenanceDetails.nominalCode === code.nominalCode && this.faultMaintenanceDetails.itemType === 6) {
        this.workOrderForm.get('nominalCode').setValue(code);
      }
      codes.push(code);
    });

    if (page && size) {
      codes = this.nominalCodes.slice((page - 1) * size, ((page - 1) * size) + size);
    }

    return codes;
  }

  getCodesAsync(page?: number, size?: number, timeout = 2000): Observable<FaultModels.NominalCode[]> {
    return new Observable<FaultModels.NominalCode[]>(observer => {
      observer.next(this.getCodes(page, size));
      observer.complete();
    }).pipe(delay(timeout));
  }

  filterCodes(codes: FaultModels.NominalCode[], text: string) {
    return codes.filter(code => {
      return code.description.toLowerCase().indexOf(text) !== -1
    });
  }

  endLoading() {
    this.commonService.hideLoader();
  }

  startLoading() {
    this.commonService.showLoader();
  }

  officeDetails() {
    return new Promise(() => {
      this.faultsService.getOfficeDetails(this.propertyDetails.office).subscribe((res) => {
        let data = res ? res : '';
        if (data) {
          this.workOrderForm.patchValue({
            mgntHoldKey: 'Contact Branch - ' + data.branding.phone
          });
        }
      });
    });
  }

  async faultNotification(action) {
    let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
    this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.JOB_COMPLETION, action);
    this.getPendingHours();
  }

  async approveInvoice() {
    this.commonService.showLoader();
    const approved = await this.pmApproveInvoice();
    if (approved) {
      this._btnHandler('refresh');
    }
  }

  async rejectInvoice() {
    const modal = await this.modalController.create({
      component: RejectInvoiceComponent,
      cssClass: 'modal-container',
      componentProps: {
        faultId: this.faultDetails.faultId,
        title: 'Job Completion',
        headingOne: "You have selected 'No, Reject this Invoice.'",
        headingTwo: 'This will escalate the Repair and a notification to Contractor would be sent. Are you sure?',
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh');
      }
    });

    await modal.present();
  }

  private getSystemOptions() {
    const params: any = new HttpParams().set('option', 'INVOICE_VERIFICATION_THRESHOLD');

    return new Promise((resolve) => {
      this.faultsService.getSystemOptions(params).subscribe(
        (res: any) => {
          resolve(res.INVOICE_VERIFICATION_THRESHOLD);
        },
        error => {
          resolve(false);
        }
      );
    });
    
  }

  private pmApproveInvoice() {
    let notificationObj = {} as any;
    notificationObj.isApproved = true;
    return new Promise((resolve) => {
      this.faultsService.pmRejectApproveInvoice(notificationObj, this.faultDetails.faultId).subscribe(
        res => {
          this.commonService.showMessage('Success', 'Invoice Approved', 'success');
          resolve(true);
        },
        error => {
          this.commonService.showMessage('Failed', 'Invoice Approved', 'error');
          resolve(false);
        }
      );
    });
    
  }

  private invoiceUploaded() {
    return new Promise((resolve) => {
      this.faultsService.invoiceUploaded(this.faultDetails.faultId).subscribe(
        res => {
          this.commonService.showMessage('Success', 'Invoice Uploaded', 'success');
          resolve(true);
        },
        error => {
          this.commonService.showMessage('Failed', 'Invoice Uploaded', 'error');
          resolve(false);
        }
      );
    });
    
  }

  getPendingHours() {
    let hours = 0;
    const currentDateTime = this.commonService.getFormatedDateTime(new Date());
    if (this.iacNotification && this.faultDetails.isEscalated && this.iacNotification.nextChaseDueAt) {
      let msec = new Date(this.iacNotification.nextChaseDueAt).getTime() - new Date(currentDateTime).getTime();
      let mins = Math.floor(msec / 60000);
      let hrs = Math.floor(mins / 60);
      if (hrs >= 0) {
        this.iacNotification.hoursLeft = hrs != 0 ? `${hrs} hours` : `${mins} minutes`;
      }
    }
  }

  async closeFault() {
    const modal = await this.modalController.create({
      component: CloseFaultModalPage,
      cssClass: 'modal-container close-fault-modal fault-modal-container',
      componentProps: {
        faultId: this.faultDetails.faultId,
        maitenanceId: this.isMaintenanceDetails ? this.faultMaintenanceDetails.maintenanceId : null
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh');
        this.commonService.showMessage('Repair has been closed successfully.', 'Close a Repair', 'success');
        return;
      }
    });

    await modal.present();
  }

  async viewNotification() {
    await this.fetchPendingNotification(this.faultDetails.faultId);
    await this.notificationModal();
  }

  async fetchPendingNotification(faultId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.faultsService.fetchPendingNotification(faultId).subscribe(
        res => {
          this.pendingNotification = res ? res : '';
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
    
  }

  async notificationModal() {
    const modal = await this.modalController.create({
      component: PendingNotificationModalPage,
      cssClass: 'modal-container fault-modal-container',
      componentProps: {
        notificationHistoryId: this.pendingNotification ? this.pendingNotification.notificationHistoryId : '',
        notificationSubject: this.pendingNotification ? this.pendingNotification.subject : '',
        notificationBody: this.pendingNotification ? this.pendingNotification.body : '',
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh');
      }
    });

    await modal.present();
  }

  resendNotification() {
    let faultNotificationId = this.iacNotification.faultNotificationId;
    if (!faultNotificationId) return;
    this.commonService.showLoader();
    this.faultsService.resendFaultNotification(faultNotificationId).subscribe((response) => {
      this.commonService.showMessage('Notification resend successfull.', 'Repair Qualification', 'success');
      this.commonService.hideLoader();
      this._btnHandler('refresh');
    }, error => {
      this.commonService.showMessage('Notification resend failed.', 'Repair Qualification', 'error');
      this.commonService.hideLoader();
    });
  }


}
