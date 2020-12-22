import { RejectionModalPage } from './../../../shared/modals/rejection-modal/rejection-modal.page';
import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { CommonService } from 'src/app/shared/services/common.service';
import { FaultsService } from '../../faults.service';
import { PROPCO, FAULT_STAGES, ARRANING_CONTRACTOR_ACTIONS, ACCESS_INFO_TYPES } from './../../../shared/constants';
import { AppointmentModalPage } from 'src/app/shared/modals/appointment-modal/appointment-modal.page';
import { ModalController } from '@ionic/angular';
import { QuoteModalPage } from 'src/app/shared/modals/quote-modal/quote-modal.page';

@Component({
  selector: 'app-arranging-contractor',
  templateUrl: './arranging-contractor.component.html',
  styleUrls: ['./arranging-contractor.component.scss', '../details.page.scss'],
})
export class ArrangingContractorComponent implements OnInit {
  raiseQuoteForm: FormGroup;
  addContractorForm: FormGroup;
  contractorListForm: FormGroup;
  userSelectedActionControl = new FormControl();
  @Input() quoteId;
  @Input() faultDetails: FaultModels.IFaultResponse;
  @Output() public btnAction: EventEmitter<any> = new EventEmitter();
  @Input() leadTenantId: any;
  @Input() quoteDocuments: any;
  faultMaintenanceDetails: FaultModels.IMaintenanceQuoteResponse;
  contractors: Observable<FaultModels.IContractorResponse>;
  private subject: Subject<string> = new Subject();
  resultsAvailable = false;
  contractorList: any;
  lookupdata: any;
  contractorSkill: any;
  faultCategories: any;
  categoryMap = new Map();
  @Input() propertyLandlords;
  isSelected = false;
  contratctorArr: string[] = [];
  isContratorSelected = false;
  iacNotification;
  iacStageActions = ARRANING_CONTRACTOR_ACTIONS.filter(action => { return action.index !== 'PROPERTY_VISIT_FOR_QUOTE' });
  accessInfoList = ACCESS_INFO_TYPES;
  isMaintenanceDetails = false;

  constructor(
    private fb: FormBuilder,
    private faultsService: FaultsService,
    private commonService: CommonService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.initiateArrangingContractors();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.leadTenantId && changes.leadTenantId.currentValue) {
      this.checkMaintenanceDetail();
    }
  }

  private initiateArrangingContractors(): void {
    this.getLookupData();
    this.initForms();
    this.initApiCalls();
  }

  private initForms(): void {
    this.initQuoteForm();
    this.initAddContractorForm();
    // this.initContractorListForm();
  }

  private initQuoteForm(): void {
    this.raiseQuoteForm = this.fb.group({
      worksOrderNumber: [this.faultDetails.reference, Validators.required],
      paidBy: ['LANDLORD', Validators.required],
      propertyId: [this.faultDetails.propertyId, Validators.required],
      category: [{ value: this.categoryMap.get(this.faultDetails.category), disabled: true }],
      description: [this.faultDetails.notes, Validators.required],
      orderedBy: [{ value: '', disabled: true }, Validators.required],
      requestStartDate: ['', Validators.required],
      contact: '',
      accessDetails: [{ value: this.getAccessDetails(this.faultDetails.isTenantPresenceRequired), disabled: true }],
      contractorList: this.fb.array([]),
      contractorIds: [],
      selectedContractorId: ''
    });
  }

  private getAccessDetails(tenantPresence): string {
    if (tenantPresence != null) {
      let data = this.accessInfoList.filter(data => data.value == tenantPresence);
      return data && data[0] ? data[0].title : '';
    }
  }

  async addContractor(data, isNew = true, isPreferred = false) {
    if (this.contratctorArr.includes(data?.contractorObj?.entityId)) {
      this.isContratorSelected = true;
      return;
    }
    if (isNew) {
      this.getContractorDetails(data?.contractorObj?.entityId);
    } else {
      this.patchContartorList(data, isNew, isPreferred);
    }
  }

  async removeContractor(i: any) {
    const contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;
    const deleteContractor = await this.commonService.showConfirm('Delete Contrator', 'Do you want to delete contractor from the list?');
    if (deleteContractor) {
      const deleteConId = contractorList.at(i).get('contractorId').value;
      const index = this.contratctorArr.indexOf(deleteConId);

      if (!this.faultMaintenanceDetails) {
        this.resetSelectedContractor(deleteConId);
        contractorList.removeAt(i);
        this.contratctorArr.splice(index, 1);
        return;
      }
      const isDeleted = await this.deleteContrator(this.faultMaintenanceDetails.maintenanceId,
        deleteConId);
      if (isDeleted) {
        this.resetSelectedContractor(deleteConId);
        contractorList.removeAt(i);
        this.contratctorArr.splice(index, 1);
      }
    }
  }

  private resetSelectedContractor(deleteConId): void {
    if (deleteConId === this.raiseQuoteForm.get('selectedContractorId').value) {
      this.raiseQuoteForm.get('selectedContractorId').setValue('');
    }
  }

  private initAddContractorForm(): void {
    this.addContractorForm = this.fb.group({
      contractor: '',
      skillSet: '',
      contractorObj: ''
    });

    this.contractors = this.addContractorForm.get('contractor').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value && value.length > 2) ? this.faultsService.searchContractor(value) :
        new Observable())
    );
  }

  private initContractorListForm(): void {
    // this.addContractorForm = this.fb.group({
    // });
  }

  private async initApiCalls() {
    this.faultMaintenanceDetails = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (this.faultMaintenanceDetails) {
      this.initPatching();
      let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
      this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
    } else {
      this.propertyLandlords.map((x) => { this.getPreferredSuppliers(x.landlordId) });
      this.checkMaintenanceDetail();
      let userDetails: any = await this.getUserDetails();
      if (userDetails) {
        this.raiseQuoteForm.get('orderedBy').setValue(userDetails.name);
      }
    }
  }

  private getFaultMaintenance() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getQuoteDetails(this.faultDetails.faultId).subscribe((res) => {
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
    this.raiseQuoteForm.patchValue(
      {
        worksOrderNumber: this.faultMaintenanceDetails.worksOrderNumber,
        description: this.faultMaintenanceDetails.description,
        orderedBy: this.faultMaintenanceDetails.orderedBy,
        requestStartDate: this.faultMaintenanceDetails.requiredStartDate,
        accessDetails: this.faultMaintenanceDetails.accessDetails,
        selectedContractorId: this.faultMaintenanceDetails.selectedContractorId,
        contact: this.faultMaintenanceDetails.contact
      }
    );
    this.faultMaintenanceDetails.quoteContractors.map((x) => { this.addContractor(x, false, false) });
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
  }

  private setLookupData(data) {
    this.contractorSkill = data.contractorSkills;
    this.faultCategories = data.faultCategories;
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
    if (this.validateReq()) {
      return;
    }
    if (!this.faultMaintenanceDetails) {
      /*raise a quote*/
      const quoteRaised = await this.raiseQuote();
      if (quoteRaised) {
        const faultUpdated = await this.updateFault();
        if (faultUpdated) {
          this._btnHandler('cancel');
        }
      }
    } else {
      /*update a quote*/
      const quoteUpdated = await this.updateQuote();
      if (quoteUpdated) {
        const addContractors = await this.addContractors();
        if (addContractors) {
          const faultContUpdated = await this.updateFaultQuoteContractor();
          if (faultContUpdated) {
            const faultUpdated = await this.updateFault();
            if (faultUpdated) {
              this._btnHandler('cancel');
            }
          }
        }
      }
    }
  }

  private raiseQuote() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.raiseQuote(this.prepareQuoteData(), this.faultDetails.faultId).subscribe((res) => {
        resolve(res);
        this.commonService.showMessage('Successfully Raised', 'Raise a Quote', 'success');
      }, error => {
        resolve(false);
        this.commonService.showMessage('Something went wrong', 'Raise a Quote', 'error');
      });
    });
    return promise;
  }

  private updateQuote() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateQuoteDetails(
        this.prepareQuoteData(), this.faultMaintenanceDetails.maintenanceId).subscribe((res) => {
          resolve(true);
          this.commonService.showMessage('Successfully Updated', 'Update Quote', 'success');
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Update Quote', 'error');
        });
    });
    return promise;
  }

  private validateReq() {
    let invalid = true;
    if (!this.raiseQuoteForm.valid) {
      this.commonService.showMessage('Please fill all required fields.', 'Quote', 'error');
      this.raiseQuoteForm.markAllAsTouched();
      return invalid;
    }
    if (this.raiseQuoteForm.value.contractorList.length == 0) {
      this.commonService.showMessage('Atleast one contractor is required for raising quote.', 'Quote', 'error');
      return invalid;
    }
    if (!this.raiseQuoteForm.get('selectedContractorId').value) {
      this.commonService.showMessage('Select atleast one contractor for raising quote.', 'Quote', 'error');
      return invalid;
    }
    return invalid = false;
  }

  private updateFaultQuoteContractor() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFaultQuoteContractor(
        { selectedContractorId: this.raiseQuoteForm.value.selectedContractorId },
        this.faultDetails.faultId,
        this.faultMaintenanceDetails.maintenanceId).subscribe((res) => {
          resolve(true);
          this.commonService.showMessage('Successfully Updated', 'Update Quote Contractor', 'success');
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Update Quote Contractor', 'error');
        });
    });
    return promise;
  }

  private updateFault(isSubmit = false) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFault(
        this.faultDetails.faultId, this.prepareFaultData(isSubmit)).subscribe((res) => {
          resolve(true);
        }, error => {
          resolve(false);
          this.commonService.showMessage('Something went wrong', 'Update Fault', 'error');
        });
    });
    return promise;
  }

  private prepareQuoteData() {
    const quoteReqObj: any = JSON.parse(JSON.stringify(this.raiseQuoteForm.getRawValue()));
    quoteReqObj.descption = quoteReqObj.description;
    delete quoteReqObj.contractorForm;
    if (!this.faultMaintenanceDetails) {
      quoteReqObj.contractorIds = quoteReqObj.contractorList.map(x => x.contractorId).filter(x => x);
      quoteReqObj.requestStartDate = this.commonService.getFormatedDate(new Date(quoteReqObj.requestStartDate));
    } else {
      quoteReqObj.requiredStartDate = this.commonService.getFormatedDate(new Date(quoteReqObj.requestStartDate));
      delete quoteReqObj.contractorIds;
    }
    delete quoteReqObj.contractorList;

    return quoteReqObj;
  }

  private prepareFaultData(isSubmit: boolean) {
    const faultReqObj: any = {};
    faultReqObj.isDraft = isSubmit ? false : true;
    faultReqObj.stage = this.faultDetails.stage;
    return faultReqObj;
  }

  private async proceed() {
    if (this.validateReq()) {
      return;
    }
    const proceed = await this.commonService.showConfirm('Raise a quote', 'Are you sure you want to send a quote request to the selected contractor(s) ?');
    if (proceed) {
      if (!this.faultMaintenanceDetails) {
        /*raise a quote*/
        const quoteRaised = await this.raiseQuote();
        if (quoteRaised) {
          const faultUpdated = await this.updateFault(true);
          if (faultUpdated) {
            this.commonService.showLoader();
            setTimeout(async () => {
              let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
              this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
            }, 3000);
          }
        }
      } else {
        /*update a quote*/
        const quoteUpdated = await this.updateQuote();
        if (quoteUpdated) {
          const faultContUpdated = await this.updateFaultQuoteContractor();
          if (faultContUpdated) {
            const faultUpdated = await this.updateFault(true);
            if (faultUpdated) {
              this.commonService.showLoader();
              setTimeout(async () => {
                let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
                this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
              }, 3000);
            }
          }
        }
      }
    }
  }

  addContractors() {
    const promise = new Promise((resolve, reject) => {
      let contractIds = [];
      this.raiseQuoteForm.get('contractorList').value.forEach(info => {
        if (info.isNew === true) {
          contractIds.push(info.contractorId);
        }
      });
      if (contractIds.length) {
        this.faultsService.addContractors(this.faultMaintenanceDetails.maintenanceId, { contractorIds: contractIds }).subscribe(
          res => {
            resolve(true);
          },
          error => {
            resolve(false);
          }
        );
      } else {
        resolve(true);
      }
    });
    return promise;
  }

  private deleteContrator(maintenanceId: string, contractorId: string) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.deleteContractor(maintenanceId, contractorId).subscribe(
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

  private getUserDetails() {
    return new Promise((resolve, reject) => {
      this.faultsService.getUserDetails().subscribe((res) => {
        let data = res ? res.data[0] : '';
        resolve(data);
      }, error => {
        reject(error)
      });
    });
  }

  updateSelection(item, i) {
    this.raiseQuoteForm.get('selectedContractorId').setValue('');
    const contlistArray = this.raiseQuoteForm.get('contractorList') as FormArray;
    if (!item.checked) {
      this.raiseQuoteForm.get('selectedContractorId').setValue(item.contractorId);
      contlistArray.controls.forEach((element, index) => {
        if (i != index) {
          element.get('checked').setValue(false);
        }
      });
    }
  }

  private getPreferredSuppliers(landlordId) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getPreferredSuppliers(landlordId).subscribe(
        res => {
          res && res.data ? res.data.map((x) => { this.addContractor(x, false, true) }) : [];
          resolve(true);
        },
        error => {
          reject(false);
        }
      );
    });
    return promise;
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
      filtereData = data.filter((x => x.faultStage === stage)).filter((x => x.faultStageAction === action));
      if (filtereData.length === 0) {
        resolve(null);
      }
      filtereData = filtereData.sort((a, b) => {
        return <any>new Date(b.firstEmailSentAt) - <any>new Date(a.firstEmailSentAt);
      });
      this.disableQuoteDetail(filtereData[0]);
      resolve(filtereData[0]);
    });
    return promise;
  }

  private disableQuoteDetail(iacNotification) {
    if (iacNotification.templateCode === 'CQ-C-E' || iacNotification.templateCode === 'LAR-L-E') {
      this.raiseQuoteForm.get('worksOrderNumber').disable();
      this.raiseQuoteForm.get('description').disable();
      this.raiseQuoteForm.get('requestStartDate').disable();
      this.raiseQuoteForm.get('contact').disable();
    }
  }

  setUserAction(index) {
    // if (this.iacNotification && !this.iacNotification.responseReceived) {
    //   this.commonService.showAlert('Arrangig Contractor', 'Please select response before proceeding with other action.');
    //   return;
    // }
    this.userSelectedActionControl.setValue(index);

  }

  private getTenantDetail(tenantId) {
    if (tenantId) {
      this.faultsService.getTenantDetails(tenantId).subscribe((res) => {
        const data = res ? res : '';
        if (data) {
          this.raiseQuoteForm.get('contact').setValue(data.fullName + ' ' + data.mobile);
        }
      }, error => {
      });
    }
  }

  private checkMaintenanceDetail() {
    if (this.isMaintenanceDetails && !this.faultMaintenanceDetails) {
      if (this.leadTenantId) {
        this.getTenantDetail(this.leadTenantId)
      }
    }
  }

  async questionAction(data) {
    if (this.iacNotification && this.iacNotification.responseReceived != null) {
      return;
    }

    if (this.iacNotification.faultStageAction === ARRANING_CONTRACTOR_ACTIONS[1].index) {
      if (this.iacNotification.templateCode === 'CQ-NA-C-E' || this.iacNotification.templateCode === 'CQ-A-C-E') {
        this.questionActionAcceptRequest(data);
      } else if (this.iacNotification.templateCode === 'CDT-C-E' || this.iacNotification.templateCode === 'CDT-T-E') {
        this.questionActionVisitTime(data);
      } else if (this.iacNotification.templateCode === 'CQ-C-E') {
        this.questionActionQuoteUpload(data);
      } else if (this.iacNotification.templateCode === 'LAR-L-E') {
        this.questionActionLLAuth(data);
      }
    }
  }

  private questionActionAcceptRequest(data) {
    if (data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure, you want to accept the quote request?', '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(data.value, this.iacNotification.faultNotificationId);
          this.commonService.showLoader();
          // setTimeout(async () => {
          let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
          this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
          // }, 1000);

        }
      });
    } else if (!data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure, you want to reject the quote request?', '', 'Yes', 'No').then(async res => {
        if (res) {
          await this.updateFaultNotification(data.value, this.iacNotification.faultNotificationId);
          this.commonService.showLoader();
          // setTimeout(async () => {
          let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
          this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
          // }, 1000);

        }
      });
    }
  }

  private async questionActionVisitTime(data) {
    if (!data.value) {
      this.commonService.showConfirm(data.text, 'Are you sure?', '', 'Yes', 'No').then(async res => {
        if (res) {
          let notificationObj = {} as FaultModels.IUpdateNotification;
          notificationObj.isAccepted = data.value;
          notificationObj.submittedByType = 'SECUR_USER';
          if (this.iacNotification.templateCode === 'CDT-T-E') {
            notificationObj.isEscalateFault = true;
          }
          await this.saveContractorVisitResponse(this.iacNotification.faultNotificationId, notificationObj);
          this.commonService.showLoader();
          let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
          this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
          this._btnHandler('refresh');

        }
      });
    } else if (data.value) {
      const modal = await this.modalController.create({
        component: AppointmentModalPage,
        cssClass: 'modal-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
          this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
        }
      });

      await modal.present();

    }
  }

  private async questionActionQuoteUpload(data) {
    if (data.value) {
      const modal = await this.modalController.create({
        component: QuoteModalPage,
        cssClass: 'modal-container upload-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
          faultId: this.faultDetails.faultId,
          maintenanceId: this.faultMaintenanceDetails.maintenanceId
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
          this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
        }
      });
      await modal.present();
    } else {
      this.commonService.showConfirm(data.text, `You have selected 'No, couldn't carry out the Quote'. The fault will be escalated tor manual intervention. Do you want to proceed?`, '', 'Yes', 'No').then(async res => {
        if (res) {
          const submit = await this.submitQuoteAmout();
          if (submit) {
            this.commonService.showLoader();
            let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
            this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
          }
        }
      });
    }
  }

  private async questionActionLLAuth(data) {
    if (!data.value) {
      const modal = await this.modalController.create({
        component: RejectionModalPage,
        cssClass: 'modal-container upload-container',
        componentProps: {
          faultNotificationId: this.iacNotification.faultNotificationId,
          lookupdata: this.lookupdata
        },
        backdropDismiss: false
      });

      modal.onDidDismiss().then(async res => {
        if (res.data && res.data == 'success') {
          let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
          this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
        }
      });
      await modal.present();
    } else {
      this.commonService.showConfirm('Please Confirm selection', `Are you sure you want to authorise this Quote`, '', 'Yes', 'No').then(async res => {
        if (res) {
          const submit = await this.saveFaultLLAuth();
          if (submit) {
            this.commonService.showLoader();
            let faultNotifications = await this.checkFaultNotifications(this.faultDetails.faultId);
            this.iacNotification = await this.filterNotifications(faultNotifications, FAULT_STAGES.ARRANGING_CONTRACTOR, 'OBTAIN_QUOTE');
          }
        }
      });
    }
  }

  async submitQuoteAmout() {
    let notificationObj = {} as any;
    notificationObj.isAccepted = false;
    notificationObj.submittedByType = 'SECUR_USER';
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveNotificationQuoteAmount(notificationObj, this.iacNotification.faultNotificationId).subscribe(
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

  saveFaultLLAuth() {
    const requestObj: any = {};
    requestObj.rejectionReason = '';
    requestObj.isAccepted = true;
    requestObj.submittedByType = 'SECUR_USER';
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveFaultLLAuth(requestObj, this.iacNotification.faultNotificationId).subscribe(res => {
        resolve(true);
      }, error => {
        this.commonService.showMessage('No Authorisation','Something went wrong','error');
        resolve(false);
      })
    });
    return promise;
  }

  private getContractorDetails(contractId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getContractorDetails(contractId).subscribe((res) => {
        let data = res ? res : '';
        this.patchContartorList(data, true, false);
      }, error => {
      });
    });
  }

  patchContartorList(data, isNew, isPreferred) {
    const contractorList = this.raiseQuoteForm.get('contractorList') as FormArray;
    const contGrup = this.fb.group({
      reference: [{ value: data.skills ? data.skills.toString() : data.occupation, disabled: true }],
      name: '',
      company: [{ value: data.company ? data.company : data.companyName, disabled: true }],
      email: '',
      mobile: [{ value: data.mobile ? data.mobile : '', disabled: true }],
      address: '',
      contractorId: data.contractorId ? data.contractorId : data.contractorObj.entityId,
      select: '',
      isPreferred,
      isNew: isNew,
      checked: isNew ? false : (data.contractorId == this.raiseQuoteForm.get('selectedContractorId').value ? true : false)
    });
    contractorList.push(contGrup);
    this.contratctorArr.push(data.contractorId ? data.contractorId : data.contractorObj.entityId);

    if (isNew) {
      this.addContractorForm.reset();
      this.isSelected = false;
    }
  }

  private async updateFaultNotification(data, faultNotificationId): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      let notificationObj = {} as FaultModels.IUpdateNotification;
      notificationObj.isAccepted = data;
      notificationObj.submittedByType = 'SECUR_USER';
      this.faultsService.updateNotification(faultNotificationId, notificationObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          reject(error)
        }
      );
    });
    return promise;
  }

  private async saveContractorVisitResponse(faultNotificationId, notificationObj): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.saveContractorVisit(faultNotificationId, notificationObj).subscribe(
        res => {
          resolve(true);
        },
        error => {
          reject(error)
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

  deleteDocument(documentId, i) {
    this.faultsService.deleteDocument(documentId).subscribe(response => {
      this.removeFile(i);
    })
  }

  removeFile(i) {
    this.quoteDocuments.splice(i, 1);
  }

}