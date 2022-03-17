import { RejectInvoiceComponent } from './../../../shared/modals/reject-invoice/reject-invoice.component';
import { WorksorderModalPage } from 'src/app/shared/modals/worksorder-modal/worksorder-modal.page';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, delay, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES, ACCESS_INFO_TYPES, MAINTENANCE_TYPES, LL_INSTRUCTION_TYPES, FAULT_QUALIFICATION_ACTIONS, KEYS_LOCATIONS, FILE_IDS, MAINT_CONTACT, CERTIFICATES_CATEGORY, FAULT_NOTIFICATION_STATE, RECIPIENTS } from './../../../shared/constants';
import { ModalController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DatePipe } from '@angular/common';
import { CloseFaultModalPage } from 'src/app/shared/modals/close-fault-modal/close-fault-modal.page';
import { PendingNotificationModalPage } from 'src/app/shared/modals/pending-notification-modal/pending-notification-modal.page';
import { forkJoin } from 'rxjs';
import { BlockManagementModalPage } from 'src/app/shared/modals/block-management-modal/block-management-modal.page';
import { PropertyCertificateModalPage } from 'src/app/shared/modals/property-certificate-modal/property-certificate-modal.page';


@Component({
  selector: 'app-job-completion',
  templateUrl: './job-completion.component.html',
  styleUrls: ['./job-completion.component.scss', '../details.page.scss'],
})
export class JobCompletionComponent implements OnInit {

  workOrderForm: FormGroup;
  addContractorForm: FormGroup;
  contractorListForm: FormGroup;
  userSelectedActionControl = new FormControl();
  @Input() faultDetails: FaultModels.IFaultResponse;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  @Input() quoteDocuments: any;
  @Input() propertyDetails;
  @Input() categoryName;
  @Input() MAX_DOC_UPLOAD_LIMIT;
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
  FAULT_STAGES = FAULT_STAGES;

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

  faultQualificationForm: FormGroup;
  certificateCategoriesMap: any = new Map();
  CERTIFICATES_CATEGORY = CERTIFICATES_CATEGORY;
  blockManagement: any;
  certificateTypes: any;
  notificationState = FAULT_NOTIFICATION_STATE;
  recipientTypes = RECIPIENTS;

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private commonService: CommonService,
    private modalController: ModalController,
    public datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.initiateJobCompletion();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.faultDetails && !changes.faultDetails.firstChange) {
      this.showSkeleton = true;
      this.initiateJobCompletion();
    }
  }

  private async initiateJobCompletion() {
    this.faultMaintenanceDetails = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (this.faultDetails.status === 19 || (this.faultMaintenanceDetails && this.faultMaintenanceDetails.itemType === MAINTENANCE_TYPES.WORKS_ORDER)) {
      /*19: Worksorder Pending*/
      this.isWorksOrder = true;
    }
    this.getLookupData();
    this.initForms();
    this.initApiCalls();
  }

  private initForms(): void {
    this.initWorkOrderForms();
    this.initFaultQualificationForm();
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
      description: [this.categoryName + " " + this.faultDetails.title, Validators.required],
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
      useCommissionRate: '',
      daytime: [{ value: '', disabled: true }],
      mobile: [{ value: '', disabled: true }]
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
    if (this.iacNotification.templateCode === 'GNR-T-E' || this.iacNotification.templateCode === 'SMF-T-E') {
      await this.getCertificateCategories();
    }
    if (this.iacNotification.templateCode === 'BMF-T-E') {
      await this.getPropertyHeadLease();
    }
    this.showSkeleton = false;
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => {
      const params: any = new HttpParams().set('showCancelled', 'true');
      this.faultsService.getQuoteDetails(this.faultDetails.faultId, params).subscribe((res) => {
        this.isMaintenanceDetails = true;
        resolve(res ? res.data[0] : {});
      }, error => {
        this.commonService.showMessage('Something went wrong', 'Arranging Contractor', 'error');
        resolve(false);
      });
    });
    return promise;
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
    this.faultsService.getNominalCodes().subscribe(data => {
      this.nominalCodes = data ? data : [];
      this.codes = this.getCodes();

    });
  }

  private setLookupData(data) {
    this.contractorSkill = data.contractorSkills;
    this.quoteStatuses = data.maintenanceQuoteStatuses;
    this.certificateTypes = data.certificateTypes;
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
      case 'proceed': {
        this.proceed();
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

  private async proceed() {
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
    const promise = new Promise((resolve, reject) => {
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
        filtereData[0].chase = filtereData[0].numberOfChasesDone + 1;
        this.disableWorksOrderDetail();
        resolve(filtereData[0]);
      } else {
        resolve(null);
      }
    });
    return promise;
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
    this.workOrderForm.get('defaultCommissionPercentage').disable();
    this.workOrderForm.get('defaultCommissionAmount').disable();
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
      let title = (this.iacNotification.templateCode === 'LF-T-E' || this.iacNotification.templateCode === 'GNR-T-E' || this.iacNotification.templateCode === 'BMF-T-E' || this.iacNotification.templateCode === 'SMF-T-E') ? 'Close Fault' : data.text;
      let message = (this.iacNotification.templateCode === 'LF-T-E' || this.iacNotification.templateCode === 'GNR-T-E' || this.iacNotification.templateCode === 'BMF-T-E' || this.iacNotification.templateCode === 'SMF-T-E') ? `This will close the Fault. Are you sure?` : `Are you sure the Tenant is satisfied with the Job?`;
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
      cssClass: 'modal-container upload-container',
      componentProps: {
        faultNotificationId: this.iacNotification.faultNotificationId,
        faultId: this.faultDetails.faultId,
        maintenanceId: this.faultMaintenanceDetails.maintenanceId,
        jobCompletionDate: this.faultMaintenanceDetails.jobCompletionAt,
        isAnyFurtherWork: this.faultDetails.isAnyFurtherWork,
        additionalEstimate: this.faultDetails.additionalEstimate,
        additionalWorkDetails: this.faultDetails.additionalWorkDetail,
        actionType: 'view',
        MAX_DOC_UPLOAD_LIMIT: this.MAX_DOC_UPLOAD_LIMIT,
        invoiceAmount: this.faultDetails.invoiceAmount,
        stage: this.faultDetails.stage
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
    return new Promise((resolve, reject) => {
      this.faultsService.getContractorDetails(contractId).subscribe((res) => {
        let data = res ? res : '';
        if (type === 'wo') {
          const addressArray = new Array();
          if (data && data.address) {
            if (data.address.addressLine1 != null && data.address.addressLine1 != '') { addressArray.push(data.address.addressLine1) }
            if (data.address.addressLine2 != null && data.address.addressLine2 != '') { addressArray.push(data.address.addressLine2) }
            if (data.address.addressLine3 != null && data.address.addressLine3 != '') { addressArray.push(data.address.addressLine3) }
            if (data.address.town != null && data.address.town != '') { addressArray.push(data.address.town) }
            if (data.address.postcode != null && data.address.postcode != '') { addressArray.push(data.address.postcode) }
          }
          const addressString = addressArray.length ? addressArray.join(', ') : '';
          this.workOrderForm.patchValue({
            company: data ? data.companyName : undefined, agentReference: data ? data.agentReference : undefined,
            // defaultCommissionPercentage: data ? data.defaultCommissionPercentage : undefined,
            // defaultCommissionAmount: data ? data.defaultCommissionAmount : undefined,
            // businessTelephone: data ? data.businessTelephone : undefined,
            daytime: data ? data.businessTelephone : undefined,
            contractorName: data ? data.fullName : undefined, address: addressString,
            contractorId: data ? data.contractorId : undefined,
            useCommissionRate: this.faultMaintenanceDetails.useCommissionRate,
            defaultCommissionPercentage: this.faultMaintenanceDetails.commissionRate ? this.faultMaintenanceDetails.commissionRate : data.defaultCommissionPercentage,
            defaultCommissionAmount: this.faultMaintenanceDetails.commissionAmount ? this.faultMaintenanceDetails.commissionAmount : data.defaultCommissionAmount,
            mobile: data ? data.mobile : undefined
          });
        }
      }, error => {
      });
    });
  }

  private async updateFaultNotification(notificationObj, faultNotificationId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateNotification(faultNotificationId, notificationObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          resolve(false);
        }
      );
    });
    return promise;
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
    const response = await this.commonService.showConfirm('Delete Media/Document', 'Do you want to delete the media/document?', '', 'YES', 'NO');
    if (response) {
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
      faultRequestObj.submittedByType = 'SECUR_USER';
      faultRequestObj.submittedById = '';
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
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFault(this.faultDetails.faultId, faultRequestObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          resolve(false);
        }
      );
    });
    return promise;
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
      let text = (event.text || '').trim().toLowerCase();
      this.getCodesAsync(this.page, 10).subscribe(codes => {
        codes = event.component.items.concat(codes);

        if (text) {
          codes = this.filterCodes(codes, text);
        }

        event.component.items = codes;
        event.component.endInfiniteScroll();
        this.page++;
      });
    }

  }

  getCodes(page?: number, size?: number) {
    let codes = [];

    this.nominalCodes.forEach(code => {
      code.concat = code.nominalCode + " - " + code.description;
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
    return new Promise((resolve, reject) => {
      this.faultsService.getOfficeDetails(this.propertyDetails.office).subscribe((res) => {
        let data = res ? res : '';
        if (data) {
          this.workOrderForm.patchValue({
            mgntHoldKey: "Contact Branch - " + data.branding.phone
          });
        }
      }, error => {
      });
    });
  }

  async faultNotification(action) {
    let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
    this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.JOB_COMPLETION, action);
    this.getPendingHours();
  }

  async approveInvoice() {
    const confirmation = await this.commonService.showConfirm('Yes, Approve this Invoice', 'This will send the Fault to Accounts team for payment. Are you sure?', '', 'Yes');
    if (confirmation) {
      this.commonService.showLoader();
      const approved = await this.pmApproveInvoice();
      if (approved) {
        this._btnHandler('refresh');
      }
    }
  }

  async rejectInvoice() {
    const modal = await this.modalController.create({
      component: RejectInvoiceComponent,
      cssClass: 'modal-container reject-invoice-modal',
      componentProps: {
        faultId: this.faultDetails.faultId,
        title: "Reject the Invoice",
        headingOne: "You have selected 'No, Reject this Invoice.'",
        headingTwo: "This will escalate the Fault and a notification to Contractor would be sent. Are you sure?",
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

    const promise = new Promise((resolve, reject) => {
      this.faultsService.getSystemOptions(params).subscribe(
        (res: any) => {
          resolve(res.INVOICE_VERIFICATION_THRESHOLD);
        },
        error => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  private pmApproveInvoice() {
    let notificationObj = {} as any;
    notificationObj.isApproved = true;
    const promise = new Promise((resolve, reject) => {
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
    return promise;
  }

  private invoiceUploaded() {
    const promise = new Promise((resolve, reject) => {
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
    return promise;
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
      cssClass: 'modal-container close-fault-modal',
      componentProps: {
        faultId: this.faultDetails.faultId,
        maitenanceId: this.isMaintenanceDetails ? this.faultMaintenanceDetails.maintenanceId : null
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this._btnHandler('refresh');
        this.commonService.showMessage('Fault has been closed successfully.', 'Close a Fault', 'success');
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
    const promise = new Promise((resolve, reject) => {
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
    return promise;
  }

  async notificationModal() {
    const modal = await this.modalController.create({
      component: PendingNotificationModalPage,
      cssClass: 'modal-container',
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
      this.commonService.showMessage('Notification resend successfull.', 'Fault Qualification', 'success');
      this.commonService.hideLoader();
      this._btnHandler('refresh');
    }, error => {
      this.commonService.showMessage('Notification resend failed.', 'Fault Qualification', 'error');
      this.commonService.hideLoader();
    });
  }

  onBlurCurrency(val: any, form: FormGroup) {
    if (!val) {
      if (form == this.workOrderForm) {
        this.workOrderForm.patchValue({
          repairCost: 0
        });
      }
    }
  }

  private initFaultQualificationForm(): void {
    this.faultQualificationForm = this.fb.group({
      isUnderBlockManagement: this.faultDetails.isUnderBlockManagement,
      isUnderWarranty: this.faultDetails.isUnderWarranty,
      isUnderServiceContract: this.faultDetails.isUnderServiceContract
    });
  }

  private async getCertificateCategories() {
    let categories = CERTIFICATES_CATEGORY;
    let apiObservableArray = [];
    if (!categories) return;
    categories.forEach(category => {
      apiObservableArray.push(this.commonService.getSystemConfig(category));
    });
    forkJoin(apiObservableArray).subscribe((res) => {
      if (res) {
        res.forEach((value) => {
          if (value) {
            Object.keys(value).forEach(async (index) => {
              this.certificateCategoriesMap.set(index, await this.fetchPropertyCertificates(value[index]));
            });
          }
        });
      }
    });
  }

  private fetchPropertyCertificates(category) {
    if (this.faultDetails.propertyId) {
      const params: any = new HttpParams().set('categories', category).set('isArchived', 'false');
      const promise = new Promise((resolve) => {
        this.faultsService.fetchPropertyCertificates(this.faultDetails.propertyId, params).subscribe(
          res => {
            if (category === "4938" && res === null) {
              this.faultQualificationForm.patchValue({ isUnderWarranty: false });
              this.faultQualificationForm.get('isUnderWarranty').updateValueAndValidity();
            }

            if (category === "4940" && res === null) {
              this.faultQualificationForm.patchValue({ isUnderServiceContract: false });
              this.faultQualificationForm.get('isUnderServiceContract').updateValueAndValidity();
            }
            resolve(res ? res.data : []);
          },
          () => {
            resolve([]);
          }
        );
      });
      return promise;
    }
  }

  private getPropertyHeadLease() {
    if (this.faultDetails.propertyId) {
      const promise = new Promise((resolve) => {
        this.faultsService.getPropertyHeadLease(this.faultDetails.propertyId).subscribe(
          res => {
            if (res) {
              this.blockManagement = (res && res.managementCompany && res.managementCompany.name && res.managementCompany.email) ? res : '';
              if (!this.blockManagement) {
                this.faultQualificationForm.patchValue({ isUnderBlockManagement: false });
                this.faultQualificationForm.get('isUnderBlockManagement').updateValueAndValidity();
              }
            }
            resolve(true);
          },
          () => {
            resolve(false);
          }
        );
      });
      return promise;
    }
  }

  async viewBlockManagement() {
    const modal = await this.modalController.create({
      component: BlockManagementModalPage,
      cssClass: 'modal-container upload-container',
      componentProps: {
        blockManagement: this.blockManagement,
        faultCategories: this.faultCategories
      },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        return;
      }
    });

    await modal.present();
  }

  async viewPropertyCertificate(category) {
    let mergedServiceContractAndApplicance;
    if (category === CERTIFICATES_CATEGORY[1]) {
      mergedServiceContractAndApplicance = [...this.certificateCategoriesMap.get(CERTIFICATES_CATEGORY[1]), ...this.certificateCategoriesMap.get(CERTIFICATES_CATEGORY[2])];
    }
    const modal = await this.modalController.create({
      component: PropertyCertificateModalPage,
      cssClass: 'modal-container property-certificates-view',
      componentProps: {
        propertyCertificate: category === CERTIFICATES_CATEGORY[0] ? this.certificateCategoriesMap.get(CERTIFICATES_CATEGORY[0]) : mergedServiceContractAndApplicance,
        certificateId: category === CERTIFICATES_CATEGORY[0] ? this.faultDetails.warrantyCertificateId : this.faultDetails.serviceContractCertificateId,
        category: category,
        certificateTypes: this.certificateTypes,
        isEditable: false
      },
      backdropDismiss: false
    });
    modal.onDidDismiss().then(async res => { });
    await modal.present();
  }

  snoozeFault(){
    this._btnHandler('snooze');
  }
}
