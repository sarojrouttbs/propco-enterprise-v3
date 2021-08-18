import { NotesService } from './notes.service';
import { Component, OnInit, Inject } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { INoteItem } from './notes-modal.model'
import { NOTES_ORIGIN, PROPCO, SYSTEM_CONFIG } from '../../constants';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notes-modal',
  templateUrl: './notes-modal.page.html',
  styleUrls: ['./notes-modal.page.scss'],
})
export class NotesModalPage implements OnInit {

  notesArray: any[];
  lookupdata: any;
  notesForm: FormGroup;
  noteObj: INoteItem;
  userDetails: any;
  notesCategories: any[];
  userLookupDetails: any[];
  notesComplaints: any[];
  notesTypes: any[];
  isAddNote: boolean;
  notesType: String;
  notesTypeId: String;
  notesOrigin;
  faultNotificationDetails;
  reference; 

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public datepipe: DatePipe,
    private notesService: NotesService
  ) {
  }

  ngOnInit() {    
    this.getLookupData();
    this.userDetails = this.commonService.getItem(PROPCO.LOGIN_DETAILS, true);
    this.notesForm = this.formBuilder.group({
      date: [''],
      category: ['', Validators.required],
      complaint: [false, Validators.required],
      type: ['', Validators.required],
      notes: ['', Validators.required]
    });
    if (this.isAddNote) {
      this.notesTypeId = this.navParams.get('notesTypeId');
      this.notesType = this.navParams.get('notesType');
      let todayDate = this.commonService.getFormatedDate(new Date());

      this.notesForm.patchValue({ date: todayDate });
    }

    
    if (this.commonService.getItem(SYSTEM_CONFIG.FAULT_DEFAULT_NOTE_CATEGORY)) {
      let category = this.commonService.getItem(SYSTEM_CONFIG.FAULT_DEFAULT_NOTE_CATEGORY);
      this.notesForm.patchValue({ category: + category });
    } else {
      this.getDefaultCategory(SYSTEM_CONFIG.FAULT_DEFAULT_NOTE_CATEGORY);
    }

    if (this.commonService.getItem(SYSTEM_CONFIG.FAULT_DEFAULT_NOTE_TYPE)) {
      let type = this.commonService.getItem(SYSTEM_CONFIG.FAULT_DEFAULT_NOTE_TYPE);
      this.notesForm.patchValue({ type: + type });
    } else {
      this.getDefaultType(SYSTEM_CONFIG.FAULT_DEFAULT_NOTE_TYPE);
    }
  }

  private async getDefaultCategory(key): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        let category = this.notesCategories.filter(x => { return x.value.toLowerCase() == res[key] });
        this.notesForm.patchValue({ category: category[0].index });
        this.commonService.setItem(SYSTEM_CONFIG.FAULT_DEFAULT_NOTE_CATEGORY, category[0].index);
        resolve(true);
      }, error => {
        resolve(true);
      });
    });
    return promise;
  }

  private async getDefaultType(key): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        let type = this.notesTypes.filter(x => { return x.value.replace(/ /g,'').toLowerCase() == 'PMC - TP3/4 - LL Notify and Discuss'.replace(/ /g,'').toLowerCase() });
        this.notesForm.patchValue({ type: type[0].index });
        this.commonService.setItem(SYSTEM_CONFIG.FAULT_DEFAULT_NOTE_TYPE, type[0].index);
        resolve(true);
      }, error => {
        resolve(true);
      });
    });
    return promise;
  }

  private async getLookupData() {
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
    this.notesCategories = data.notesCategories;
    this.userLookupDetails = data.userLookupDetails;
    this.notesComplaints = data.notesComplaint;
    this.notesTypes = data.notesType;
  }

  createNote() {
    

    if (this.notesForm.valid) {
      const requestObj = this.notesForm.value;
      requestObj.complaint = requestObj.complaint ? this.notesComplaints[1].index : this.notesComplaints[0].index;
      delete requestObj.date;
      if (this.notesOrigin && this.notesOrigin == NOTES_ORIGIN.FAULT_STAGE) {
        let notesDesc = this.notesForm.value.notes;
        let updatedNotesDesc = '';
        requestObj.notes = '';
        if (this.faultNotificationDetails && this.faultNotificationDetails.length) {
          updatedNotesDesc = 'Fault ID: ' + this.reference + '<br>Notification ID: ' + this.faultNotificationDetails[0] +' - '+this.faultNotificationDetails[1]  +' <br>Notes: <br>'+ notesDesc;
        } else {
          updatedNotesDesc = 'Fault ID: ' + this.reference +' <br>Notes: <br>'+ notesDesc;
        }
        requestObj.notes = updatedNotesDesc;
      }
  
      this.notesService.createFaultNotes(this.notesTypeId, requestObj).subscribe(res => {
        this.modalController.dismiss(res);

      }, err => {
        this.commonService.showMessage(err.message, 'Add Note', 'error');
      });
    } else {
      // this.commonService.showMessage('Please fill all the required fields.', 'Add Note', 'error');
      this.notesForm.markAllAsTouched();
    }
  }

  dismiss() {
    this.modalController.dismiss({
      dismissed: true
    });
  }
}
