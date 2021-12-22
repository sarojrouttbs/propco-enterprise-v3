import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { APPLICATION_STATUSES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { TobService } from '../tob.service';
import { ApplicationData } from './application-list.model';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.page.html',
  styleUrls: ['./application-list.page.scss'],
})
export class ApplicationListPage implements OnInit {
  paginatorConfig = {
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25, 100],
    showFirstLastButtons: true
  };
  maxDate = new Date();
  @ViewChild('paginator') paginator: MatPaginator;
  obsApplicationList: Observable<any>;
  filteredApplicationList: MatTableDataSource<ApplicationData> = new MatTableDataSource<ApplicationData>([]);
  isApplicationSelected: boolean = false;
  selectedApplicationRow: any;
  isHideRejected: boolean = false;
  propertyId: string;
  propertyDetails;
  applicationsDetails;
  applicationList = [];
  lookupdata: any;
  rentFrequencyTypes: any;
  applicationStatusTypes: any;
  toblookupdata: any;
  fromDate = new FormControl('', []);
  toDate = new FormControl('', []);
  
  constructor(private router: Router, private route: ActivatedRoute, private tobService: TobService, private commonService: CommonService) {
    this.getTobLookupData();
    this.getLookUpData();
  }

  ngOnInit() {
    this.obsApplicationList = this.filteredApplicationList.connect();
    this.initData();
  }

  private initData() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');
    this.initApiCalls();
  }

  private async initApiCalls() {
    this.propertyDetails = await this.getPropertyById();
    this.applicationsDetails = await this.getApplicationList();
    this.applicationList = this.applicationsDetails?.applications;
    this.initApplicationList();
  }

  private initApplicationList() {
    this.filteredApplicationList.data = this.applicationsDetails.applications as ApplicationData[];
    this.filteredApplicationList.paginator = this.paginator;
  }

  private getApplicationList() {
    return new Promise((resolve, reject) => {
      this.tobService.getApplicationList(this.propertyId).subscribe(
        (res) => {
          if (res) {
            resolve(res);
          } else {
            resolve([]);
          }
        }
      )
    });
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
    this.applicationStatusTypes = this.toblookupdata.applicationStatuses;
  }
  
  getStatusColor(status) {
    var colorName = "";
    switch (status) {
      case 0:
      case 1:
      case 4:
        colorName = 'tertiary';
        break;
      case 2:
        colorName = 'success';
        break;
      case 3:
        colorName = 'danger';
        break;
    }
    return colorName;
  }

  showMenu(event, id, data, className, isCard?) {
    this.selectedApplicationRow = data;
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
      top: origDivOverlayTop,
      right: '5px',
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

  hideRecords() {
    if (!this.isHideRejected) {
      this.isHideRejected = true;
      this.filteredApplicationList.data = this.filteredApplicationList.data.filter((res) => {
        if (res.status !== APPLICATION_STATUSES.REJECTED) {
          return true;
        }
      });
    } else {
      this.filteredApplicationList.data = this.applicationList;
      this.isHideRejected = false;
    }
  }

  filterByDate() {
    this.filteredApplicationList.data = this.applicationList;
    this.filteredApplicationList.data = this.filteredApplicationList.data.filter(e => new Date(this.commonService.getFormatedDate(e.createdAt, 'yyyy-MM-dd')) >= new Date(this.commonService.getFormatedDate(this.fromDate.value, 'yyyy-MM-dd')) && new Date(this.commonService.getFormatedDate(e.createdAt, 'yyyy-MM-dd')) <= new Date(this.commonService.getFormatedDate(this.toDate.value, 'yyyy-MM-dd')));
  }

  resetFilters() {
    this.fromDate.reset();
    this.toDate.reset();
    this.filteredApplicationList.data = this.applicationList;
  }

  rejectAllApplications() {

  }

  createApplication() {
    this.router.navigate([`tob/${this.propertyId}/create-application`], { replaceUrl: true });
  }

  acceptApplication() {

  }

  rejectApplication() {

  }

  holdApplication() {

  }

  markHoldingDepositPaid() {

  }

  startReferencing() {

  }

  viewDetails() {

  }
}
