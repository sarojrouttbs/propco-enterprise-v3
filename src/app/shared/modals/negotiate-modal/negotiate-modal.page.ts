import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { OFFER_STATUSES, PROPCO } from '../../constants';
import { CommonService } from '../../services/common.service';
import { CommentItem } from './negotiate-modal.model';
import { NegotiateService } from './negotiate.service';

@Component({
  selector: 'app-negotiate-modal',
  templateUrl: './negotiate-modal.page.html',
  styleUrls: ['./negotiate-modal.page.scss'],
})
export class NegotiateModalPage implements OnInit {
  commentsArray: any[];
  heading: string;
  negotiateForm: FormGroup;
  commentObj: CommentItem;
  userDetails: any;
  date: any;
  clauseObj: any;
  offerStatus: any;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public datepipe: DatePipe,
    private negotiateService: NegotiateService
  ) {
  }

  ngOnInit() {
    this.initData();
  }

  private initData() {
    this.userDetails = this.commonService.getItem(PROPCO.LOGIN_DETAILS, true);
    this.clauseObj = this.navParams.get('data');
    this.heading = this.navParams.get('heading');
    this.offerStatus = this.navParams.get('offerStatus');
    this.negotiateForm = this.formBuilder.group({
      comment: ['']
    });
    if (this.offerStatus == OFFER_STATUSES.ACCEPTED || this.offerStatus == OFFER_STATUSES.WITHDRAWN_BY_APPLICANT) {
      this.negotiateForm.controls['comment'].disable();
    }
    else {
      this.negotiateForm.controls['comment'].enable();
    }
    this.getComments();
  }

  private async getComments() {
    console.log('this.clauseObj', this.clauseObj)
    let commentsArray;
    if (this.clauseObj.offerClauseId) {
      commentsArray = await this.getClauseNegotiationComments(this.clauseObj.offerClauseId);
    } else if (this.clauseObj.offerRestrictionId) {
      commentsArray = await this.getRestrictionNegotiationComments(this.clauseObj.offerRestrictionId);
    } else {
      commentsArray = this.clauseObj.negotiations;
    }
    this.commentsArray = commentsArray ? commentsArray : [];
  }

  createNote() {
    console.log('this.userDetails', this.userDetails)
    this.commentObj = {};
    this.commentObj.comment = this.negotiateForm.controls['comment']?.value;
    this.commentObj.negotiatedByName = this.userDetails?.name;
    this.commentObj.negotiatedBy = 'APPLICANT';
    this.negotiateForm.reset();
    if (this.clauseObj.offerClauseId) {
      this.saveCommentsAgainstClause(this.clauseObj.offerClauseId, [this.commentObj]);
    } else if (this.clauseObj.offerRestrictionId) {
      this.saveCommentsAgainstRestriction(this.clauseObj.offerRestrictionId, [this.commentObj]);
    } else {
      this.commentObj.createdAt = this.datepipe.transform(new Date(), 'yyyy/MM/dd hh:mm');
      this.commentsArray.push(this.commentObj);
    }
  }

  private saveCommentsAgainstClause(offerClauseId, clauseComments: any[]) {
    this.negotiateService.saveCommentsAgainstClause(offerClauseId, clauseComments).subscribe(res => {
      this.getComments();
    }, error => {
      console.log(error);
    });
  }

  private saveCommentsAgainstRestriction(offerRestrictionId, restrictionComments: any[]) {
    this.negotiateService.saveCommentsAgainstRestriction(offerRestrictionId, restrictionComments).subscribe(res => {
      this.getComments();
    }, error => {
      console.log(error);
    });
  }

  dismiss() {
    if ((this.clauseObj.offerRestrictionId || this.clauseObj.offerClauseId)) {
      this.modalController.dismiss();
    } else {
      this.clauseObj.negotiations = this.commentsArray;
      this.modalController.dismiss(this.clauseObj);
    }
  }

  private async getClauseNegotiationComments(offerClauseId) {
    let promise = new Promise((resolve, reject) => {
      this.negotiateService.getClauseNegotiationComments(offerClauseId).subscribe(res => {
        resolve((res && res.data) || []);
      }, error => {
        reject(undefined);
        console.log(error);
      });
    });
    return promise;
  }

  private async getRestrictionNegotiationComments(offerRestrictionId) {
    let promise = new Promise((resolve, reject) => {
      this.negotiateService.getRestrictionNegotiationComments(offerRestrictionId).subscribe(res => {
        resolve((res && res.data) || []);
      }, error => {
        reject(undefined);
        console.log(error);
      });
    });
    return promise;
  }

}
