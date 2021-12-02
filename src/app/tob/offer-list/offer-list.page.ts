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
import { offerData, offerNotesData } from './offer-list.model';
import { OfferListService } from './offer-list.service';
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
    { key: '4', value: 'Status' }];

  paginatorConfig = {
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    showFirstLastButtons: true
  }

  propertyDetails: any;
  offerNotes: any = [];
  propertyId: string;
  offerList: offerData[];
  accessRight: any;

  constructor(private modalController: ModalController, private route: ActivatedRoute, private commonService: CommonService, private offerListService: OfferListService) {
    // let tobLookupData = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    // if (tobLookupData) {
    //   this.setTobLookupData(tobLookupData);
    // }
    // else {
    //   this.offerListService.getTOBLookup().subscribe(data => {
    //     this.commonService.setItem(PROPCO.TOB_LOOKUP_DATA, data);
    //     this.setTobLookupData(data);
    //   });
    // }
  }

  private setTobLookupData(data) {
    console.log('data', data);
    // this.faultEventsLookup = data.faultEvents;
    // this.setFaultEventMap();
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
      origDivOverlayTop = baseContainerTop + $('.dataTables_length').outerHeight(true);
    } else {
      origDivOverlayHeight = divOverlayHeight + (divOverlayTopBottomPadding * 2);
      const extraHeight = divOverlayHeight - baseContainerHeight;
      origDivOverlayTop = baseContainerTop - extraHeight - (divOverlayTopBottomPadding * 2) + $('.dataTables_length').outerHeight(true);
    }

    divOverlay.css({
      position: 'absolute',
      top: origDivOverlayTop,
      right: '0px',
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

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  onOfferClick(offerData) {
    // get offer notes API call
    this.initOfferNotesListData()
  }

  private initOfferNotesListData() {
    this.isOfferSelected = true;
    this.offerNotes = this.offerNotes as offerNotesData[];
    this.filteredNotesList.data = this.offerNotes;
  }

  private getPropertyById() {
    const promise = new Promise((resolve, reject) => {
      this.offerListService.getPropertyById(this.propertyId).subscribe(
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
      this.offerListService.getOfferList(this.propertyId).subscribe(
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
      this.offerListService.getUserAccessRight().subscribe(
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
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container',
      componentProps: {
        notesType: 'fault',
        // notesTypeId: this.selectedData.faultId,
        isAddNote: true
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
      if (res.data && res.data.noteId) {
        // this.getFaultNotes(this.selectedData.faultId);
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
    const response = await this.commonService.showConfirm('Offer', 'Are you sure, you want to remove this note ?', '', 'YES', 'NO');
    if (response) {
      console.log('response', response)
      // this.offerListService.deleteNote(documentId).subscribe(response => {
      //   call get note list API
      // });
    }
  }

  editNote() {

  }
}