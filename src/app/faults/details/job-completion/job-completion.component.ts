import { RejectInvoiceComponent } from './../../../shared/modals/reject-invoice/reject-invoice.component';
import { WorksorderModalPage } from 'src/app/shared/modals/worksorder-modal/worksorder-modal.page';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, delay, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES, ACCESS_INFO_TYPES, MAINTENANCE_TYPES, LL_INSTRUCTION_TYPES } from './../../../shared/constants';
import { ModalController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DatePipe } from '@angular/common';
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
      mgntHoldKey: [{ value: 'No', disabled: true }],
      keysLocation: this.faultDetails.doesBranchHoldKeys ? 'Return to Branch' : '',
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
    if (tenantPresence != null) {
      let data = this.accessInfoList.filter(data => data.value == tenantPresence);
      return data && data[0] ? data[0].title : '';
    }
  }




  private async initApiCalls() {
    if (this.faultMaintenanceDetails) {
      if (this.faultDetails.status === 8) {
        this.INVOICE_VERIFICATION_THRESHOLD = await this.getSystemOptions() as number;
      }
      this.initPatching();
      await this.faultNotification(this.faultDetails.stageAction);
    }
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => {
      const params: any = new HttpParams().set('showCancelled', 'false');
      this.faultsService.getQuoteDetails(this.faultDetails.faultId, params).subscribe((res) => {
        this.isMaintenanceDetails = true;
        resolve(res ? res.data[0] : undefined);
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
          contractorId: this.faultMaintenanceDetails.selectedContractorId,
          nominalCode: this.faultMaintenanceDetails.nominalCode,
          fullDescription: this.faultMaintenanceDetails.fullDescription,
          repairCost: this.faultMaintenanceDetails.amount,
          keysLocation: this.faultMaintenanceDetails.keysLocation,
          requiredDate: this.faultMaintenanceDetails.requiredCompletionDate
        }
      );
      this.workOrderForm.get('contractorName').disable();
      this.woSelectContractor(this.faultMaintenanceDetails.selectedContractorId);
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
      filtereData = data.filter((x => x.faultStage === stage)).filter((x => x.faultStageAction === action)).filter((x => x.isResponseExpected));
      if (filtereData.length === 0) {
        resolve(null);
      }
      filtereData = filtereData.sort((a, b) => {
        return <any>new Date(b.firstEmailSentAt) - <any>new Date(a.firstEmailSentAt);
      });
      if (filtereData && filtereData[0]) {
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
    this.workOrderForm.get('accessDetails').disable();
  }

  setUserAction(index) {
    this.isUserActionChange = true;
    this.userSelectedActionControl.setValue(index);
  }

  async questionAction(data) {
    if (this.iacNotification && this.iacNotification.responseReceived != null) {
      return;
    }

    if (this.faultMaintenanceDetails.itemType === MAINTENANCE_TYPES.WORKS_ORDER) {
      if (this.iacNotification.templateCode === 'CF-T-E') {
        this.questionActionSatisfyJob(data);
      }
      else if (this.iacNotification.templateCode === 'INR-C-E' || 'IR-C-E') {
        //TODO add IPD
      }
    }
  }

  private questionActionSatisfyJob(data) {
    let notificationObj = {} as FaultModels.IUpdateNotification;
    notificationObj.isAccepted = data.value;
    notificationObj.submittedByType = 'SECUR_USER';
    if (data.value) {
      this.commonService.showConfirm(data.text, `Are you sure, you want to accept the request?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
          this._btnHandler('refresh');
        }
      });
    } else if (!data.value) {
      this.commonService.showConfirm(data.text, `Are you sure, you want to reject the request?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(notificationObj, this.iacNotification.faultNotificationId);
          this._btnHandler('refresh');
        }
      });
    }
  }

  async openWOJobCompletionModal() {
    const modal = await this.modalController.create({
      component: WorksorderModalPage,
      cssClass: 'modal-container upload-container',
      componentProps: {
        faultNotificationId: this.iacNotification.faultNotificationId,
        faultId: this.faultDetails.faultId,
        maintenanceId: this.faultMaintenanceDetails.maintenanceId,
        actionType: 'view'
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data == 'success') {
        this.btnAction.emit('refresh');
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
            defaultCommissionPercentage: data ? data.defaultCommissionPercentage : undefined,
            defaultCommissionAmount: data ? data.defaultCommissionAmount : undefined,
            businessTelephone: data ? data.businessTelephone : undefined,
            contractorName: data ? data.fullName : undefined, address: addressString,
            contractorId: data ? data.contractorId : undefined
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

  downloadDocumentByURl(url) {
    this.commonService.downloadDocumentByUrl(url);
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
        title: "Job Completion",
        headingOne: "You have selected 'No, Reject this Invoice.'",
        headingTwo: "This will escalate the Fault and a notification to Contractor would be sent. Are you sure ?",
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
}
