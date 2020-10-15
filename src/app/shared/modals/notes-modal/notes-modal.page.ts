import { Component, OnInit, Input, Inject } from '@angular/core';
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
  heading: string;
  notesForm: FormGroup;
  noteObj: INoteItem;
  userDetails: any;
  date: any;
  clauseObj: any;
  offerStatus: any;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public datepipe: DatePipe
  ) {
  }

  ngOnInit() {
    this.userDetails = this.commonService.getItem(PROPCO.LOGIN_DETAILS, true);
    this.clauseObj = this.navParams.get('data');
    this.heading = this.navParams.get('heading');
    this.offerStatus = this.navParams.get('offerStatus');
    this.notesForm = this.formBuilder.group({
      comment: ['']
    });
    /* if (this.offerStatus == OFFER_STATUS.ACCEPTED || this.offerStatus == OFFER_STATUS.WITHDRAWN_BY_APPLICANT) {
      this.notesForm.controls['comment'].disable();
    }
    else {
      this.notesForm.controls['comment'].enable();
    } */
    this.getNotes();
  }

  async getNotes() {
    let notesArray;
    notesArray = this.clauseObj.negotiations;
    this.notesArray = notesArray ? notesArray : [];
  }

  createNote() {
    this.noteObj = {};
    this.noteObj.comment = this.notesForm.controls['comment'].value;
    this.noteObj.negotiatedByName = this.userDetails.name;
    this.noteObj.negotiatedBy = 'APPLICANT';
    this.notesForm.reset();
    if (this.clauseObj.offerClauseId) {
      //this.saveNotesAgainstClause(this.clauseObj.offerClauseId, [this.noteObj]);
    } else if (this.clauseObj.offerRestrictionId) {
      //this.saveNotesAgainstRestriction(this.clauseObj.offerRestrictionId, [this.noteObj]);
    } else {
      this.noteObj.createdAt = this.datepipe.transform(new Date(), 'yyyy/MM/dd hh:mm');
      this.notesArray.push(this.noteObj);
    }
  }

  dismiss() {
    if ((this.clauseObj.offerRestrictionId || this.clauseObj.offerClauseId)) {
      this.modalController.dismiss();
    } else {
      this.clauseObj.negotiations = this.notesArray;
      this.modalController.dismiss(this.clauseObj);
    }
  }
}
