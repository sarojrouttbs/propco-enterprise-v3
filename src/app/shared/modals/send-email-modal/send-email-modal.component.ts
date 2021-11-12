import { HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Editor } from 'ngx-editor';
import { FaultsService } from 'src/app/faults/faults.service';
import { NGX_EDITOR_TOOLBAR_SETTINGS, FAULT_STATUSES, LL_INSTRUCTION_TYPES, MAINTENANCE_TYPES, PROPERTY_LINK_STATUS, RECIPIENT, RECIPIENTS, MAINTENANCE_TYPES_FOR_SEND_EMAIL } from '../../constants';
import { CommonService } from '../../services/common.service';
import { SendEmailService } from './send-email-modal.service';

@Component({
  selector: 'app-send-email-modal',
  templateUrl: './send-email-modal.component.html',
  styleUrls: ['./send-email-modal.component.scss'],
})
export class SendEmailModalPage implements OnInit, AfterViewChecked, OnDestroy {
  editor: Editor;
  editorToolbar = NGX_EDITOR_TOOLBAR_SETTINGS;

  faultDetails;
  propertyDetails;
  faultCategoryName;

  sendEmailForm: FormGroup;
  selectedRecipient: any = '';

  isLandlord: boolean = false;
  isTenant: boolean = false;
  isContractor: boolean = false;

  landLordList: any = [];
  tenantList: any = [];
  coTenantList: any = [];
  leadTenantList: any = [];
  contractorListPrefSupplier: any = [];
  contractorsListQuote: any = [];
  contractorsListWorksOrder: any = [];
  contractorsListEstimated: any = [];

  showLoader: boolean = false;
  currentMaintainanceType: string;
  maintainanceTypes = MAINTENANCE_TYPES_FOR_SEND_EMAIL;
  recipient = RECIPIENT;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private faultsService: FaultsService,
    private changeDetector: ChangeDetectorRef,
    private sendEmailService: SendEmailService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.editor = new Editor();
    this.selectedRecipient = '';
    console.log(this.faultDetails)
    this.initForm();
    this.setMaintainanceType();
  }

  private setMaintainanceType() {
    if (this.faultDetails.stageAction === LL_INSTRUCTION_TYPES[1].index || this.faultDetails.status === FAULT_STATUSES.WORKSORDER_PENDING) {
      this.currentMaintainanceType = MAINTENANCE_TYPES_FOR_SEND_EMAIL.WO;
    } else if (this.faultDetails.stageAction === LL_INSTRUCTION_TYPES[4].index || this.faultDetails.status === FAULT_STATUSES.CHECKING_LANDLORD_INSTRUCTIONS) {
      this.currentMaintainanceType = MAINTENANCE_TYPES_FOR_SEND_EMAIL.ESTIMATE;
    } else if (this.faultDetails.stageAction === LL_INSTRUCTION_TYPES[2].index || this.faultDetails.status === FAULT_STATUSES.QUOTE_PENDING) {
      this.currentMaintainanceType = MAINTENANCE_TYPES_FOR_SEND_EMAIL.QUOTE;
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetector.detectChanges();
  }

  private initForm() {
    this.sendEmailForm = this.formBuilder.group({
      entityType: ['', Validators.required],
      entityId: this.formBuilder.array([]),
      emailSubject: [((this.propertyDetails?.address?.addressLine1 ? this.propertyDetails?.address?.addressLine1 : '') + (this.faultCategoryName ? ':' + this.faultCategoryName : '')), [Validators.required, Validators.maxLength(255)]],
      emailBody: ['', Validators.required]
    });
  }

  onRecipientClick(recipient) {
    this.selectedRecipient = recipient;
    this.isLandlord = false;
    this.isTenant = false;
    this.isContractor = false;
    if (recipient === RECIPIENTS.LANDLORD) {
      this.initLLData();
    };
    if (recipient === RECIPIENTS.TENANT) {
      this.initTTData();
    };
    if (recipient === RECIPIENTS.CONTRACTOR) {
      this.initCCData();
    };
  }

  private initLLData() {
    if (!this.landLordList || this.landLordList.length <= 0 || this.landLordList === []) {
      this.getLandlordList();
    } else {
      this.isLandlord = true;
    }
  }

  private initTTData() {
    if (!this.tenantList || this.tenantList.length <= 0 || this.tenantList === []) {
      this.getTenantList();
    } else {
      this.isTenant = true;
    }
  }

  private initCCData() {
    if (!this.contractorListPrefSupplier || this.contractorListPrefSupplier.length <= 0 || this.contractorListPrefSupplier === []) {
      this.getLandlordList();
    } else {
      this.isContractor = true;
    }
  }

  get recipientArray(): FormArray {
    return this.sendEmailForm.controls.entityId as FormArray;
  }

  private getLandlordList() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getLandlordsOfProperty(this.propertyDetails.propertyId).subscribe(
        res => {
          this.landLordList = res && res.data ? res.data.filter((llDetail => (llDetail.propertyLinkStatus === PROPERTY_LINK_STATUS.CURRENT) && (llDetail.status === 1 || llDetail.status === 3))) : [];
          this.landLordList.forEach((item) => {
            item.isChecked = false;
          });
          this.isLandlord = true;
          if (this.selectedRecipient === RECIPIENTS.CONTRACTOR) {
            this.isLandlord = false;
            if (this.landLordList.length > 0) {
              this.getLandlordId();
            }
            if (this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.ESTIMATE) {
              this.contractorsListEstimated ? this.setEstimatedContractor() : this.isContractor = true;
            }
            if (this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.WO || this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.QUOTE) {
              this.getQuoteContractorList();
            } else {
              setTimeout(() => {
                this.isContractor = true;
              }, 2000);
            }
          }
          resolve(this.landLordList);
        },
        (error) => {
          resolve(this.landLordList);
        }
      );
    });
    return promise;
  }

  private getMaxRentShareLandlord(landlords) {
    let maxRent = 0;
    let mLandlord;
    landlords.forEach(landlord => {
      if (landlord.rentPercentage > maxRent) {
        maxRent = landlord.rentPercentage;
        mLandlord = landlord;
      }
    });
    return mLandlord;
  }

  private getLandlordId() {
    let landlordId;
    if (this.landLordList.length > 1) {
      let landlord = this.getMaxRentShareLandlord(this.landLordList);
      landlordId = landlord.landlordId
    } else {
      landlordId = this.landLordList[0]?.landlordId;
    }
    this.getPreferredContractorList(landlordId)
  }

  private getTenantList() {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getPropertyTenancies(this.propertyDetails.propertyId).subscribe(
        res => {
          // this.tenantList = res ? res.data : [];
          this.tenantList = res && res.data ? res.data.filter((ttDetail => (ttDetail.hasCheckedIn === true))) : [];
          this.getTenantDetails();
          resolve(this.tenantList);
        },
        (error) => {
          resolve(this.tenantList);
        }
      );
    });
    return promise;
  }

  private getTenantDetails() {
    const tenantList = this.tenantList;
    tenantList.forEach(element => {
      element.tenants.forEach(item => {
        this.getSingleTenantDetails(item.tenantId).then(data => {
          item.fullName = data['fullName']
          item.email = data['email']
        })
      });
    });
    this.tenantList = tenantList;
    this.setLeadCoLeadTenants();
  }

  private getSingleTenantDetails(tenantId) {
    return new Promise((resolve, reject) => {
      this.faultsService.getTenantDetails(tenantId).subscribe((res) => {
        const tenantDetails = res ? res : {};
        resolve(tenantDetails);
      }, error => {
        reject(error)
      });
    });
  }

  private setLeadCoLeadTenants() {
    const tenantList = this.tenantList;
    this.leadTenantList = [];
    this.coTenantList = [];
    tenantList.forEach(element => {
      element.tenants.forEach(item => {
        const obj = {
          hasCheckedIn: element.hasCheckedIn,
          tenant: item,
          isChecked: false
        };
        (item.isLead) ? this.leadTenantList.push(obj) : this.coTenantList.push(obj);
      });
    });
    setTimeout(() => {
      this.isTenant = true;
    }, 1000);
  }

  private getPreferredContractorList(landlordId) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.getPreferredSuppliers(landlordId).subscribe(
        res => {
          this.contractorListPrefSupplier = res ? res.data : [];
          this.contractorListPrefSupplier.forEach((item) => {
            item.isChecked = false;
            this.getSingleContractorDetails(item.contractorId).then(data => {
              item.fullName = data['fullName'];
              item.email = data['email'];
            });
          });
          if (this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.ESTIMATE) {
            this.contractorsListEstimated ? this.setEstimatedContractor() : this.isContractor = true;
          } else if (this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.WO || this.currentMaintainanceType === MAINTENANCE_TYPES_FOR_SEND_EMAIL.QUOTE) {
            (this.contractorsListQuote || this.contractorsListWorksOrder) ? this.getQuoteContractorList() : this.isContractor = true;
          } 
          else {
            setTimeout(() => {
              this.isContractor = true;
            }, 1000);
          }
          resolve(this.contractorListPrefSupplier);
        },
        (error) => {
          resolve(this.contractorListPrefSupplier);
        }
      );
    });
    return promise;
  }

  private getFaultMaintenance(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const params: any = new HttpParams().set('showCancelled', 'true');
      this.faultsService.getQuoteDetails(this.faultDetails.faultId, params).subscribe((res) => {
        resolve(res ? res.data[0] : {});
      }, error => {
        resolve(false);
      });
    });
    return promise;
  }

  private async getQuoteContractorList() {
    const faultMaintenance = await this.getFaultMaintenance() as FaultModels.IMaintenanceQuoteResponse;
    if (faultMaintenance.itemType === MAINTENANCE_TYPES.QUOTE) {
      const quoteContractorsList = faultMaintenance?.quoteContractors;
      quoteContractorsList.forEach(element => {
        element['isChecked'] = false;
        this.contractorListPrefSupplier.forEach((item, index) => {
          if (item.contractorId === element.contractorId) this.contractorListPrefSupplier.splice(index, 1);
        });
      });
      this.contractorsListQuote = [...quoteContractorsList];
    }
    if (faultMaintenance.itemType === MAINTENANCE_TYPES.WORKS_ORDER) {
      const woContractorsList = [];
      await this.getSingleContractorDetails(faultMaintenance.contractorId).then(data => {
        data['isChecked'] = false;
        woContractorsList.push(data);
      })
      woContractorsList.forEach(element => {
        this.contractorListPrefSupplier.forEach((item, index) => {
          if (item.contractorId === element.contractorId) this.contractorListPrefSupplier.splice(index, 1);
        });
      });
      this.contractorsListWorksOrder = [...woContractorsList];
    }
    setTimeout(() => {
      this.isContractor = true;
    }, 2000);
  }

  private getSingleContractorDetails(contractorId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.faultsService.getContractorDetails(contractorId).subscribe((res) => {
        const contractorDetails = res ? res : {};
        resolve(contractorDetails);
      }, error => {
        reject(error)
      });
    });
  }

  onCheckbox(event: any) {
    if(event.target.checked) this.recipientArray.clear();
  }

  onCheckboxClick(event: any, obj, type, entityType) {
    obj.isChecked = event.target.checked;
    this.sendEmailForm.controls.entityType.setValue(entityType);
    if (event.target.checked) {
      if (type == 'landlord') {
        this.landLordList.forEach(ele => {
          if (ele?.landlordId != obj?.landlordId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.landlordId, recipientName: obj?.fullName, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'leadTenant') {
        this.leadTenantList.forEach(ele => {
          if (ele?.tenant?.tenantId != obj?.tenant?.tenantId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.tenant?.tenantId, recipientName: obj?.tenant?.fullName, recipientEmail: obj?.tenant?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'coTenant') {
        this.coTenantList.forEach(ele => {
          if (ele?.tenant?.tenantId != obj?.tenant?.tenantId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.tenant?.tenantId, recipientName: obj?.tenant?.fullName, recipientEmail: obj?.tenant?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'preferred_supplier') {
        this.contractorListPrefSupplier.forEach(ele => {
          if (ele.contractorId != obj?.contractorId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.contractorId, recipientName: obj?.company, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }
      
      if (type == 'estimate_contractor') {
        this.contractorsListEstimated.forEach(ele => {
          if (ele.contractorId != obj?.contractorId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.contractorId, recipientName: obj?.companyName, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'quote_contractor') {
        this.contractorsListQuote.forEach(ele => {
          if (ele.contractorId != obj?.contractorId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.contractorId, recipientName: obj?.company, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }

      if (type == 'wo_contractor') {
        this.contractorsListWorksOrder.forEach(ele => {
          if (ele.contractorId != obj?.contractorId) {
            ele.isChecked = false;
          }
        });
        this.recipientArray.clear();
        this.recipientArray.push(this.formBuilder.control({ id: obj?.contractorId, recipientName: obj?.companyName, recipientEmail: obj?.email }, Validators.required));
        this.resetAllCheck(type);
      }
    }
    this.checkRecipientError();
  }

  private resetAllCheck(type) {
    if (type !== 'landlord') {
      this.landLordList.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'leadTenant') {
      this.leadTenantList.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'coTenant') {
      this.coTenantList.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'preferred_supplier') {
      this.contractorListPrefSupplier.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'estimate_contractor') {
      this.contractorsListEstimated.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'quote_contractor') {
      this.contractorsListQuote.forEach(element => {
        element.isChecked = false;
      });
    }
    if (type !== 'wo_contractor') {
      this.contractorsListWorksOrder.forEach(element => {
        element.isChecked = false;
      });
    }
  }

  private checkRecipientError() {
    if (this.sendEmailForm.controls['entityId']?.value?.length === 0) {
      this.sendEmailForm.controls['entityId'].setErrors({ requiredError: true });
    } else {
      this.sendEmailForm.controls['entityId'].setErrors(null);
    }
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  sendMail() {
    this.showLoader = true;
    if (this.sendEmailForm.valid) {
      let requestObj = {
        emailBody: this.sendEmailForm.controls['emailBody'].value,
        emailSubject: this.sendEmailForm.controls['emailSubject'].value,
        entityId: this.sendEmailForm.controls['entityId'].value[0].id,
        entityType: this.sendEmailForm.controls['entityType'].value,
        submittedById: '',
        submittedByType: 'SECUR_USER'
      };
      this.sendEmailService.sendEmail(this.faultDetails.faultId, requestObj).subscribe(
        res => {
          this.showLoader = false;
          this.modalController.dismiss('success');
        },
        error => {
          this.showLoader = false;
          this.commonService.showMessage((error.error && error.error.message) ? error.error.message : error.error, 'Send email error', 'error');
        }
      );
    } else {
      this.showLoader = false;
      this.sendEmailForm.markAllAsTouched();
      this.checkRecipientError();
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  private async setEstimatedContractor() {
    const estimateContractorsList = [];
    await this.getSingleContractorDetails(this.faultDetails.contractorId).then(data => {
      data['isChecked'] = false;
      estimateContractorsList.push(data);
    });
    estimateContractorsList.forEach(element => {
      this.contractorListPrefSupplier.forEach((item, index) => {
        if (item.contractorId === element.contractorId) this.contractorListPrefSupplier.splice(index, 1);
      });
    });
    this.contractorsListEstimated = [...estimateContractorsList];

    setTimeout(() => {
      this.isContractor = true;
    }, 2000);
  }
}
