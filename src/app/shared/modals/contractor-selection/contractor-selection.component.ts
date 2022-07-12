import { DEFAULTS, FAULT_STATUSES } from './../../constants';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CommonService } from './../../services/common.service';
import { FaultsService } from './../../../faults/faults.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contractor-selection',
  templateUrl: './contractor-selection.component.html',
  styleUrls: ['./contractor-selection.component.scss'],
})
export class ContractorSelectionComponent implements OnInit {
  contractorList;
  faultId;
  showLoader: boolean = false;
  selectedContractorId;
  selectionForm: FormGroup;
  title;
  faultDetails;
  stageAction;
  nominalCode;
  unSavedData = false;
  DEFAULTS = DEFAULTS;

  constructor(private formBuilder: FormBuilder,
    private modalController: ModalController,
    private commonService: CommonService,
    private faultsService: FaultsService) {
  }

  ngOnInit() {
    this.selectionForm = this.formBuilder.group({
      contractorList: this.formBuilder.array([])
    });
    if (this.contractorList) {
      this.contractorList.map((data) => {
        this.patchContartorList(data);
      });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async proceed() {
    this.showLoader = true;
    let faultRequestObj: any = {};
    if (this.selectedContractorId) {
      faultRequestObj.contractorId = this.selectedContractorId;
    }
    faultRequestObj.stageAction = this.stageAction;
    faultRequestObj.isDraft = false;
    faultRequestObj.stage = this.faultDetails.stage;
    faultRequestObj.nominalCode = this.nominalCode;
    faultRequestObj.submittedById = '';
    faultRequestObj.submittedByType = 'SECUR_USER';
    const isFaultUpdated = await this.updateFaultSummary(faultRequestObj);
    const isStatusUpdated = await this.updateFaultStatus(FAULT_STATUSES.WORKSORDER_PENDING);
    if (isFaultUpdated && isStatusUpdated) {
      this.modalController.dismiss('success');
    }
  }

  patchContartorList(data) {
    const contractorList = this.selectionForm.get('contractorList') as FormArray;
    const contGrup = this.formBuilder.group({
      reference: data.reference,
      name: data.name,
      company: data.company,
      email: data.email,
      mobile: data.mobile,
      address: '',
      contractorId: data.contractorId,
      checked: false
    });
    contractorList.push(contGrup);
  }

  updateSelection(item, i) {
    this.selectedContractorId = '';
    const contlistArray = this.selectionForm.get('contractorList') as FormArray;
    if (!item.checked) {
      this.selectedContractorId = item.contractorId;
      contlistArray.controls.forEach((element, index) => {
        if (i != index) {
          element.get('checked').setValue(false);
        }
      });
    }
  }

  updateFaultSummary(faultRequestObj) {
    const promise = new Promise((resolve, reject) => {
      this.faultsService.updateFault(this.faultDetails.faultId, faultRequestObj).subscribe(
        res => {
          this.showLoader = false;
          this.commonService.showMessage('Successfully Updated', this.title, 'success');
          resolve(true);
        },
        error => {
          this.showLoader = false;
          this.commonService.showMessage('Something went wrong', this.title, 'error');
          resolve(false);
        }
      );
    });
    return promise;
  }

  private async updateFaultStatus(status) {
    return this.faultsService.updateFaultStatus(this.faultId, status).subscribe((res) => {
      return true;
    }, err => {
      this.commonService.showMessage('Something went wrong', this.title, 'error');
      return false;
    });
  }

  async onCancel() {
    if(this.selectedContractorId){
      this.unSavedData = true;
    }else{
      this.dismiss();
    }
  }

  continue(){
    this.unSavedData = false;
  }
}
