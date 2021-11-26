import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { OFFER_STATUSES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import * as data from './offer-api.json';
import { offerData } from './offer-list.model';
@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.page.html',
  styleUrls: ['./offer-list.page.scss'],
})

export class OfferListPage implements OnInit {
  maxDate = new Date();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  offerList = [];
  filteredOfferList: MatTableDataSource<offerData> = new MatTableDataSource<offerData>();
  selectedRow: any;
  isHideRejected: boolean = false;
  sortKey = null;
  fromDate = null;
  toDate = null;
  sortingFields = [
    { key: '1', value: 'Date' },
    { key: '2', value: 'Offer Price (Desc)' },
    { key: '3', value: 'Offer Price (Asc)' },
    { key: '4', value: 'Status' }];
  propertyDetails = data.offerDetails;
  tobLookupData: any;
  offerStatuses: any;
  offerNotes: any = [];

  constructor(private commonService: CommonService) {
    // this.tobLookupData = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
    // if (this.tobLookupData) {
    //   this.setLookupData();
    // } else {
    //   this.commonService.getTOBLookup().subscribe(data => {
    //     this.commonService.setItem(PROPCO.TOB_LOOKUP_DATA, data);
    //     this.setLookupData();
    //   }, error => {
    //   });
    // }
  }

  ngOnInit() {
    console.log('offer', this.propertyDetails)
    this.filteredOfferList.paginator = this.paginator;
    this.offerList = this.propertyDetails.offers as offerData[];
    this.filteredOfferList.data = this.offerList;
    this.sortKey = '1';
    this.sortResult();
    console.log(this.offerList)
  }

  sortResult() {
    let key = this.sortKey;
    switch (key) {
      case '1': {
        this.filteredOfferList.data.sort((val1, val2) => {
          return +new Date(val2.offerAt) - +new
            Date(val1.offerAt)
        })
        break;
      }
      case '2': {
        this.filteredOfferList.data.sort((val1, val2) => { return val2.amount - val1.amount })
        break;
      }
      case '3': {
        this.filteredOfferList.data.sort((val1, val2) => { return val1.amount - val2.amount })
        break;
      }
      case '4': {
        this.filteredOfferList.data.sort((val1, val2) => { return val1.status - val2.status });
        break;
      }
    }
  }

  // private setLookupData(){
  //   this.tobLookupData = this.commonService.getItem(PROPCO.TOB_LOOKUP_DATA, true);
  //   this.offerStatuses = this.tobLookupData.offerStatuses;
  // }

  filterByDate() {
    this.filteredOfferList.data = this.filteredOfferList.data.filter(e => new Date(e.offerAt) >= new Date(this.fromDate) && new Date(e.offerAt) <= new Date(this.toDate));
  }

  resetFilters() {
    this.fromDate = null;
    this.toDate = null;
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
    console.log('event', event);
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

}