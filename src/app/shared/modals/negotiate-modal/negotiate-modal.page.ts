import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { DATE_FORMAT } from '../../constants';
import { CommonService } from '../../services/common.service';
import { CommentItem, UserDetails } from './negotiate-modal.model';
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
  userDetails: UserDetails;
  clauseObj: any;

  constructor(
    private navParams: NavParams,
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private negotiateService: NegotiateService,
    private commonService: CommonService
  ) {
  }

  ngOnInit() {
    this.initData();
  }

  private async initData() {
    this.clauseObj = this.navParams.get('data');
    this.heading = this.navParams.get('heading');
    this.negotiateForm = this.formBuilder.group({
      comment: ['']
    });
    this.userDetails = await this.getUserDetails();
    this.getComments();
  }

  private async getComments() {
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
    this.commentObj = {};
    this.commentObj.comment = this.negotiateForm.controls['comment']?.value;
    this.commentObj.negotiatedByName = this.userDetails?.name;
    this.commentObj.negotiatedBy = 'AGENT';
    this.negotiateForm.reset();
    if (this.clauseObj.offerClauseId) {
      this.saveCommentsAgainstClause(this.clauseObj.offerClauseId, [this.commentObj]);
    } else if (this.clauseObj.offerRestrictionId) {
      this.saveCommentsAgainstRestriction(this.clauseObj.offerRestrictionId, [this.commentObj]);
    } else {
      this.commentObj.createdAt = this.commonService.getFormatedDate(new Date(), DATE_FORMAT.DATE_TIME);
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
  }

  private getUserDetails() {
    return new Promise((resolve, reject) => {
      this.commonService.getUserDetails().subscribe((res) => {
        if(res) {
          resolve(res.data[0]);
        } else {
          resolve('');
        }
      }, error => {
        reject(error)
      });
    });
  }
}
