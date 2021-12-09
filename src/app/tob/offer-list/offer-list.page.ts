import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { OFFER_STATUSES, PROPCO } from 'src/app/shared/constants';
import { NotesModalPage } from 'src/app/shared/modals/notes-modal/notes-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { offerData, offerNotesData } from './offer-list.model';
@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.page.html',
  styleUrls: ['./offer-list.page.scss']
})

export class OfferListPage implements OnInit {
  maxDate = new Date();
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  @ViewChild('notesPaginator', { static: true }) notesPaginator: MatPaginator;
  obsOfferList: Observable<any>;
  obsOfferNotesList: Observable<any>;
  filteredOfferList: MatTableDataSource<offerData> = new MatTableDataSource<offerData>();
  filteredNotesList: MatTableDataSource<offerNotesData> = new MatTableDataSource<offerNotesData>();
  isOfferSelected: boolean = false;
  selectedRow: any;
  isHideRejected: boolean = false;
  sortKey = null;
  fromDate = new FormControl('', []);
  toDate = new FormControl('', []);
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
  offerList: offerData[];
  accessRight: any;
  toblookupdata: any;
  lookupdata: any;
  offerStatuses: any;
  rentFrequencyTypes: any;  
  notesCategories: any;
  notesComplaints: any;
  notesTypes: any;
  isEditNote: boolean = false;

  constructor(private modalController: ModalController, private route: ActivatedRoute, private commonService: CommonService, private tobService: TobService) {
    this.getTobLookupData();
    this.getLookUpData();
  }

  ngOnInit() {
    this.initData();
  }

  private initData() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');
    this.initPaginators();
    this.initApiCalls();
  }

  private initPaginators() {
    this.filteredOfferList.paginator = this.paginator;
    this.filteredNotesList.paginator = this.notesPaginator;
    this.obsOfferList = this.filteredOfferList.connect();
    this.obsOfferNotesList = this.filteredNotesList.connect();
  }

  private async initApiCalls() {
    this.accessRight = await this.getUserAccessRight();
    this.offerList = await this.getOfferList() as offerData[];
    this.propertyDetails = await this.getPropertyById();
    this.initOfferList();
  }

  private initOfferList() {
    this.filteredOfferList.data = this.offerList as offerData[];
    this.sortKey = '1';
    this.sortResult();
  }

  sortResult() {
    const dataToSort = this.filteredOfferList.data;
    let key = this.sortKey;
    switch (key) {
      case '1': {
        dataToSort.sort((val1, val2) => {
          return +new Date(val2.offerAt) - +new
            Date(val1.offerAt)
        })
        break;
      }
      case '2': {
        dataToSort.sort((val1, val2) => { return val2.amount - val1.amount })
        break;
      }
      case '3': {
        dataToSort.sort((val1, val2) => { return val1.amount - val2.amount })
        break;
      }
      case '4': {
        dataToSort.sort((val1, val2) => { return val1.status - val2.status });
        break;
      }
    }
    this.filteredOfferList.data = dataToSort;
  }

  filterByDate() {
    this.filteredOfferList.data = this.offerList;
    this.filteredOfferList.data = this.filteredOfferList.data.filter(e => new Date(this.commonService.getFormatedDate(e.offerAt, 'yyyy-MM-dd')) >= new Date(this.commonService.getFormatedDate(this.fromDate.value, 'yyyy-MM-dd')) && new Date(this.commonService.getFormatedDate(e.offerAt, 'yyyy-MM-dd')) <= new Date(this.commonService.getFormatedDate(this.toDate.value, 'yyyy-MM-dd')));
  }

  resetFilters() {
    this.fromDate.reset();
    this.toDate.reset();
    this.filteredOfferList.data = this.offerList;
  }

  hideRecords() {
    if (!this.isHideRejected) {
      this.isHideRejected = true;
      this.filteredOfferList.data = this.filteredOfferList.data.filter((res) => {
        if (res.status !== OFFER_STATUSES.REJECTED) {
          return true;
        }
      });
    }
    else {
      this.filteredOfferList.data = this.offerList;
      this.isHideRejected = false;
    }
  }

  showMenu(event, id, data, className, isCard?) {
    this.selectedRow = data;
    const baseContainer = $(event.target).parents('.' + className);
    const divOverlay = $('#' + id);
    const baseContainerWidth = baseContainer.outerWidth(true);
    const baseContainerHeight = baseContainer.outerHeight(true);
    const baseContainerPosition = baseContainer.position();
    const baseContainerTop = baseContainerPosition.top;
    const divOverlayWidth = divOverlay.css('width', baseContainerWidth + 'px');
    const divOverlayHeight = divOverlay.height();
    const overlayContainerLeftPadding = (divOverlay.parent('.overlay-container').innerWidth() - divOverlay.parent('.overlay-container').width()) / 2;
    const divOverlayLeft = isCard ? baseContainerPosition.left : overlayContainerLeftPadding;

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

    divOverlay.css({
      position: 'absolute',
      top: origDivOverlayTop+6,
      right: '25px',
      width: baseContainerWidth,
      height: origDivOverlayHeight,
      left: divOverlayLeft,
      paddingTop: divOverlayTopBottomPadding,
      paddingBottom: divOverlayTopBottomPadding
    });

    const gridDivOverlay = $('#grid-divoverlay');

    gridDivOverlay.css({
      width: divOverlay.width(),
      height: divOverlayHeight
    });

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

  async onOfferClick(offerData) {
    this.offerNotes = await this.getNotesList(offerData.offerId) as offerNotesData[];
    this.initOfferNotesListData()
  }

  private initOfferNotesListData() {
    this.isOfferSelected = true;
    this.offerNotes = this.offerNotes as offerNotesData[];
    this.filteredNotesList.data = this.offerNotes;
  }

  private getPropertyById() {
    const promise = new Promise((resolve, reject) => {
      this.tobService.getPropertyDetails(this.propertyId).subscribe(
        res => {
          if (res && res.data) {
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
    return promise;
  }

  private getOfferList() {
    return new Promise((resolve, reject) => {
      this.tobService.getOfferList(this.propertyId).subscribe(
        (res) => {
          if (res && res.data) {
            resolve(res.data);
          } else {
            resolve([]);
          }
        }
      )
    });
  }

  private getUserAccessRight() {
    return new Promise((resolve, reject) => {
      this.tobService.getUserAccessRight().subscribe(
        async (res) => {
          if (res) {
            resolve(res);
          } else {
            resolve({});
          }
        }
      )
    });
  }

  async notesModal() {
    const offerId = "08c5d41c-710b-4a64-ba09-6abbe9a51288";
    const noteData = {
      category: 3267,
      complaint: 4066,
      dateTime: "2021-12-02 16:57:52",
      noteId: 1640,
      notes: "test Test",
      propertyAddress: null,
      propertyId: null,
      propertyReference: null,
      type: 1441,
      userEmail: null,
      userId: "b4a64efa-f323-11ea-b5cf-02420aff001e",
      userName: null
    }
    // remove above offerId & noteData constant after integration is done.
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container',
      componentProps: {
        noteData: noteData,
        notesType: 'offer',
        notesTypeId: offerId,
        isAddNote: this.isEditNote ? false : true
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
      if (res.data && res.data.noteId) {
        // call get note list API
      }
    });
    await modal.present();
  }

  getStatusColor(status) {
    var colorName = "";
    switch (status) {
      case 0: //New
      case 6: //Counter Offer By LL/Agent
      case 7: //Counter Offer By Applicant
        colorName = 'tertiary';
        break;
      case 1: //Accepted
      case 5: //Agreed in Principle
        colorName = 'success';
        break;
      case 2: //Rejected
      case 3: //Withdrawn by Applicant
      case 4: //Withdrawn by Landlord
        colorName = 'danger';
        break;
    }
    return colorName;
  }

  async removeNote() {
    let noteId = 1648;  // remove this constant after integration is done.
    const response = await this.commonService.showConfirm('Offer', 'Are you sure, you want to remove this note ?', '', 'YES', 'NO');
    if (response) {
      this.commonService.deleteNote(noteId).subscribe(response => {
        // call get note list API
      });
    }
  }

  addNote() {
    this.isEditNote = false;
    this.notesModal();
  }

  editNote() {
    this.isEditNote = true;
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
      }, error => {
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
    return new Promise((resolve, reject) => {
      this.tobService.getNotesList(offerId).subscribe(
        (res) => {
          if (res && res.data) {
            resolve(res.data);
          } else {
            resolve([]);
          }
        }
      )
    });
  }
}