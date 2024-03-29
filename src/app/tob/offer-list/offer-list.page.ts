import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DATE_FORMAT, DEFAULTS, NOTES_TYPE, OFFER_STATUSES, PROPCO } from 'src/app/shared/constants';
import { NotesModalPage } from 'src/app/shared/modals/notes-modal/notes-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { OfferData, OfferNotesData } from './offer-list.model';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.page.html',
  styleUrls: ['./offer-list.page.scss']
})

export class OfferListPage implements OnInit {
  maxDate = this.commonService.getFormatedDate(new Date().toUTCString());
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('notesPaginator') notesPaginator: MatPaginator;
  obsOfferList: Observable<any>;
  obsOfferNotesList: Observable<any>;
  filteredOfferList: MatTableDataSource<OfferData> = new MatTableDataSource<OfferData>([]);
  filteredNotesList: MatTableDataSource<OfferNotesData> = new MatTableDataSource<OfferNotesData>([]);
  isOfferSelected = false;
  selectedOfferRow: any;
  selectedNotesRow: any;
  isHideRejected = false;
  sortKey = null;
  filterForm: FormGroup;
  sortingFields = [
    { key: '1', value: 'Date' },
    { key: '2', value: 'Offer Price (Desc)' },
    { key: '3', value: 'Offer Price (Asc)' },
    { key: '4', value: 'Status' }
  ];
  paginatorConfig = {
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    showFirstLastButtons: true
  };
  propertyDetails: any;
  offerNotes: any = [];
  propertyId: string;
  offerList: OfferData[];
  accessRight: any;
  toblookupdata: any;
  lookupdata: any;
  offerStatuses: any;
  rentFrequencyTypes: any;
  notesCategories: any;
  notesComplaints: any;
  notesTypes: any;
  isAddNote = false;
  isRecordsAvailable = true;
  isPropertyDetailsAvailable = false;
  isOffersListAvailable = false;
  DATE_FORMAT = DATE_FORMAT;
  DEFAULTS = DEFAULTS;

  constructor(
    private router: Router,
    private modalController: ModalController,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private tobService: TobService,
    private formBuilder: FormBuilder
  ) {
    this.getTobLookupData();
    this.getLookUpData();
  }

  ngOnInit() {
    this.obsOfferList = this.filteredOfferList.connect();
    this.obsOfferNotesList = this.filteredNotesList.connect();
    this.initData();
    this.initFilterForm();
  }

  private initData() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');

    if (!this.propertyId) {
      this.propertyId = this.route.snapshot.parent.parent.paramMap.get('propertyId');
    }
    this.initApiCalls();
  }

  private initFilterForm() {
    this.filterForm = this.formBuilder.group({
      fromDate: [''],
      toDate: ['']
    });
  }

  private async initApiCalls() {
    this.accessRight = await this.getUserAccessRight();
    this.offerList = await this.getOfferList() as OfferData[];
    this.propertyDetails = await this.getPropertyById();
    this.initOfferList();
  }

  private initOfferList() {
    this.filteredOfferList.data = this.offerList;
    this.filteredOfferList.paginator = this.paginator;
    this.sortKey = '1';
    this.sortResult();
    this.checkOffersAvailable();
    this.commonService.customizePaginator('paginator');
  }

  sortResult() {
    const dataToSort = this.filteredOfferList.data;
    const key = this.sortKey;
    switch (key) {
      case '1': {
        dataToSort.sort((val1, val2) => {
          return +new Date(val2.offerAt) - +new Date(val1.offerAt);
        });
        break;
      }
      case '2': {
        dataToSort.sort((val1, val2) => val2.amount - val1.amount);
        break;
      }
      case '3': {
        dataToSort.sort((val1, val2) => val1.amount - val2.amount);
        break;
      }
      case '4': {
        dataToSort.sort((val1, val2) => val1.status - val2.status);
        break;
      }
    }
    this.filteredOfferList.data = dataToSort;
  }

  filterByDate() {
    this.filteredOfferList.data = this.offerList;
    this.filteredOfferList.data = this.filteredOfferList.data.filter(e => new Date(this.commonService.getFormatedDate(e.offerAt, this.DATE_FORMAT.YEAR_DATE)) >= new Date(this.commonService.getFormatedDate(this.filterForm.controls.fromDate.value, this.DATE_FORMAT.YEAR_DATE)) && new Date(this.commonService.getFormatedDate(e.offerAt, this.DATE_FORMAT.YEAR_DATE)) <= new Date(this.commonService.getFormatedDate(this.filterForm.controls.toDate.value, this.DATE_FORMAT.YEAR_DATE)));
    this.checkOffersAvailable();
  }

  resetFilters() {
    this.filterForm.controls.fromDate.reset();
    this.filterForm.controls.toDate.reset();
    this.filteredOfferList.data = this.offerList;
    this.checkOffersAvailable();
  }

  hideRecords() {
    if (!this.isHideRejected) {
      this.isHideRejected = true;
      this.filteredOfferList.data = this.filteredOfferList.data.filter((res) => {
        if (res.status !== OFFER_STATUSES.REJECTED) {
          return true;
        }
      });
    } else {
      this.filteredOfferList.data = this.offerList;
      this.isHideRejected = false;
    }
    this.checkOffersAvailable();
  }

  showMenu(event: any, id: any, data: any, className: any, isCard?: any, isOffer?: any) {
    if (isOffer)
      this.selectedOfferRow = data;
    else
      this.selectedNotesRow = data;
    const baseContainer = $(event.target).parents('.' + className);
    const divOverlay = $('#' + id);
    const baseContainerWidth = baseContainer.outerWidth(true);
    const baseContainerHeight = baseContainer.outerHeight(true);
    const baseContainerPosition = baseContainer.position();
    const baseContainerTop = baseContainerPosition.top;
    const divOverlayHeight = divOverlay.height();
    const divOverlayLeft = baseContainerPosition.left;

    let origDivOverlayHeight;
    let origDivOverlayTop;
    let divOverlayTopBottomPadding = 0;
    if (baseContainerHeight > 49) {
      divOverlayTopBottomPadding = (baseContainerHeight - 48) / 2;
    }

    if (baseContainerHeight > divOverlayHeight) {
      origDivOverlayHeight = baseContainerHeight;
      origDivOverlayTop = baseContainerTop;
    } else {
      origDivOverlayHeight = divOverlayHeight + (divOverlayTopBottomPadding * 2);
      const extraHeight = divOverlayHeight - baseContainerHeight;
      origDivOverlayTop = baseContainerTop - extraHeight - (divOverlayTopBottomPadding * 2);
    }

    const helperContainer = $(".overlay-skeleton");
    if (id != 'offer-notes-overlay') {
      divOverlay.css({
        position: 'absolute',
        top: origDivOverlayTop + 23,
        right: '5px',
        width: helperContainer.outerWidth(true) + 12,
        height: helperContainer.outerHeight(true),
        left: helperContainer.position().left,
        paddingTop: divOverlayTopBottomPadding,
        paddingBottom: divOverlayTopBottomPadding
      });
    } else {
      divOverlay.css({
        position: 'absolute',
        top: origDivOverlayTop,
        right: '5px',
        width: baseContainerWidth,
        height: origDivOverlayHeight,
        left: divOverlayLeft,
        paddingTop: divOverlayTopBottomPadding,
        paddingBottom: divOverlayTopBottomPadding
      });
    }


    divOverlay.delay(200).slideDown('fast');
    event.stopPropagation();
  }

  hideMenu(event?, id?) {
    const $divOverlay = $('#' + id);
    $divOverlay.delay(200).slideUp('fast');
    if (event) {
      event.stopPropagation();
    }
  }

  onOfferClick(offerData) {
    this.selectedOfferRow = offerData;
    this.getOfferNotes(offerData.offerId);
  }

  private async getOfferNotes(offerId) {
    this.hideMenu('', 'offer-overlay');
    this.hideMenu('', 'offer-notes-overlay');
    this.offerNotes = await this.getNotesList(offerId) as OfferNotesData[];
    await this.initOfferNotesListData();
    this.commonService.customizePaginator('notesPaginator');
  }

  private initOfferNotesListData() {
    this.isOfferSelected = true;
    this.offerNotes = this.offerNotes as OfferNotesData[];
    this.filteredNotesList.data = this.offerNotes;
    this.filteredNotesList.paginator = this.notesPaginator;
  }

  private getPropertyById() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.tobService.getPropertyDetails(this.propertyId, params).subscribe(
        res => {
          if (res && res.data) {
            this.isPropertyDetailsAvailable = true;
            resolve(res.data);
          } else {
            resolve({});
          }
        },
        error => {
          console.log(error);
          resolve(0);
        }
      );
    });
  }

  private getOfferList() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.tobService.getOfferList(this.propertyId, params).subscribe(
        (res) => {
          this.isOffersListAvailable = true;
          if (res && res.data) {
            resolve(res.data);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  private getUserAccessRight() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.tobService.getUserAccessRight(params).subscribe(
        async (res) => {
          if (res) {
            resolve(res);
          } else {
            resolve({});
          }
        }
      );
    });
  }

  async notesModal() {
    const offerId = this.selectedOfferRow?.offerId;
    const noteData = this.selectedNotesRow;
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container offer-notes-modal-height tob-modal-container',
      componentProps: {
        noteData: this.isAddNote ? {} : noteData,
        notesType: NOTES_TYPE.OFFER,
        notesTypeId: this.isAddNote ? offerId : '',
        isAddNote: this.isAddNote ? true : false
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(res => {
      if (res.data && res.data.noteId) {
        this.getOfferNotes(offerId);
      }
    });
    await modal.present();
  }

  getStatusColor(status) {
    let colorName = '';
    switch (status) {
      case 0: // New
      case 6: // Counter Offer By LL/Agent
      case 7: // Counter Offer By Applicant
        colorName = 'tertiary';
        break;
      case 1: // Accepted
      case 5: // Agreed in Principle
        colorName = 'success';
        break;
      case 2: // Rejected
      case 3: // Withdrawn by Applicant
      case 4: // Withdrawn by Landlord
        colorName = 'danger';
        break;
    }
    return colorName;
  }

  async removeNote() {
    const offerId = this.selectedOfferRow?.offerId;
    const noteId = this.selectedNotesRow?.noteId;
    const response = await this.commonService.showConfirm('Offer', 'Are you sure, you want to remove this note ?', '', 'YES', 'NO');
    if (response) {
      this.commonService.deleteNote(noteId).subscribe(res => {
        this.getOfferNotes(offerId);
      });
    }
  }

  addNote() {
    this.isAddNote = true;
    this.notesModal();
  }

  editNote() {
    this.isAddNote = false;
    this.notesModal();
  }

  private getTobLookupData() {
    this.toblookupdata = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    if (this.toblookupdata) {
      this.setTobLookupData();
    }
    else {
      this.commonService.getTobLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.TOB_LOOKUP_DATA, data);
        this.setTobLookupData();
      });
    }
  }

  private setTobLookupData(): void {
    this.toblookupdata = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    this.offerStatuses = this.toblookupdata.offerStatuses;
  }

  private getLookUpData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData();
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.setLookupData();
      });
    }
  }

  private setLookupData(): void {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.rentFrequencyTypes = this.lookupdata.advertisementRentFrequencies;
    this.notesCategories = this.lookupdata.notesCategories;
    this.notesComplaints = this.lookupdata.notesComplaint;
    this.notesTypes = this.lookupdata.notesType;
  }

  private getNotesList(offerId) {
    return new Promise((resolve) => {
      this.tobService.getNotesList(offerId).subscribe(
        (res) => {
          if (res && res.data) {
            resolve(res.data);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  viewDetails(offerId?) {
    if (offerId !== undefined && offerId !== null) {
      this.router.navigate([`../offer/${offerId}/view`], { replaceUrl: true, relativeTo: this.route });
    } else if (this.selectedOfferRow?.offerId !== undefined && this.selectedOfferRow?.offerId !== null) {
      this.router.navigate([`../offer/${this.selectedOfferRow.offerId}`], { replaceUrl: true, relativeTo: this.route });
    }
  }

  makeAnOffer() {
    this.router.navigate([`../create-offer`], { replaceUrl: true, relativeTo: this.route });
  }

  onPaginateChange(isNotes) {
    isNotes ? this.hideMenu('', 'offer-notes-overlay') : this.hideMenu('', 'offer-overlay');
  }

  private checkOffersAvailable() {
    this.isRecordsAvailable = this.filteredOfferList?.data.length > 0 ? true : false;
  }
}
