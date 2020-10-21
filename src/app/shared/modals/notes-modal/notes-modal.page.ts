import { NotesService } from './notes.service';
import { Component, OnInit, Inject } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { INoteItem } from './notes-modal.model'
import { PROPCO } from '../../constants';
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
  notesType: String; notesTypeId: String;



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
