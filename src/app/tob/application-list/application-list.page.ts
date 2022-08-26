import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { APPLICATION_STATUSES, DATE_FORMAT, DEFAULTS, PROPCO, REFERENCING_TYPES } from 'src/app/shared/constants';
import { HoldingDepositePaidModalPage } from 'src/app/shared/modals/holding-deposite-paid-modal/holding-deposite-paid-modal.page';
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
  isApplicationSelected = false;
  selectedApplicationRow: any;
  isHideRejected = false;
  propertyId: string;
  propertyDetails;
  applicationsDetails;
  applicationList = [];
  lookupdata: any;
  rentFrequencyTypes: any;
  applicationStatusTypes: any;
  offlinePaymentTypes: any;
  toblookupdata: any;
  fromDate = new FormControl('', []);
  toDate = new FormControl('', []);
  referencingInfodata: any;
  referencingInfo: any;
  isRecordsAvailable = true;
  isPropertyDetailsAvailable = false;
  isApplicationListAvailable = false;
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;

  constructor(private modalController: ModalController, private router: Router, private route: ActivatedRoute, private tobService: TobService, private commonService: CommonService) {
    this.getTobLookupData();
    this.getLookUpData();
    this.getReferancingInfo();
  }

  ngOnInit() {
    this.obsApplicationList = this.filteredApplicationList.connect();
    this.initData();
  }

  private initData() {
    this.propertyId = this.route.snapshot.paramMap.get('propertyId');
    if (!this.propertyId) {
      this.propertyId = this.route.snapshot.parent.parent.paramMap.get('propertyId');
    }
    this.initApiCalls();
  }

  private async initApiCalls() {
    this.hideMenu('', 'tob-application-overlay');
    this.propertyDetails = await this.getPropertyById();
    this.applicationsDetails = await this.getApplicationList();
    this.applicationList = (this.applicationsDetails.applications && this.applicationsDetails.applications.length > 0) ? this.applicationsDetails.applications as ApplicationData[] : [];
    this.initApplicationList();
  }

  private initApplicationList() {
    this.filteredApplicationList.data = this.applicationList;
    this.filteredApplicationList.paginator = this.paginator;
    this.filteredApplicationList.paginator.pageIndex = 0;
    this.checkApplicationsAvailable();
    this.commonService.customizePaginator('paginator');
  }

  private getApplicationList() {
    return new Promise((resolve) => {
      this.tobService.getApplicationList(this.propertyId).subscribe(
        (res) => {
          if (res) {
            this.isApplicationListAvailable = true;
            resolve(res);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  private getPropertyById() {
    return new Promise((resolve) => {
      this.tobService.getPropertyDetails(this.propertyId).subscribe(
        res => {
          if (res && res.data) {
            this.isPropertyDetailsAvailable = true;
            resolve(res.data);
          } else {
            resolve({});
          }
        },
        error => {
          resolve(0);
        }
      );
    });
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
    this.offlinePaymentTypes = this.toblookupdata.offlinePaymentTypes;
  }

  getStatusColor(status) {
    let colorName = '';
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
    this.checkApplicationsAvailable();
  }

  filterByDate() {
    this.filteredApplicationList.data = this.applicationList;
    this.filteredApplicationList.data = this.filteredApplicationList.data.filter(e => new Date(this.commonService.getFormatedDate(e.createdAt, this.DATE_FORMAT.YEAR_DATE)) >= new Date(this.commonService.getFormatedDate(this.fromDate.value, this.DATE_FORMAT.YEAR_DATE)) && new Date(this.commonService.getFormatedDate(e.createdAt, this.DATE_FORMAT.YEAR_DATE)) <= new Date(this.commonService.getFormatedDate(this.toDate.value, this.DATE_FORMAT.YEAR_DATE)));
    this.checkApplicationsAvailable();
  }

  resetFilters() {
    this.fromDate.reset();
    this.toDate.reset();
    this.filteredApplicationList.data = this.applicationList;
    this.checkApplicationsAvailable();
  }

  createApplication() {
    this.router.navigate([`../create-application`], { replaceUrl: true, relativeTo: this.route });
  }

  rejectAllApplications() {
    this.commonService.showConfirm('Reject All Application', 'Are you sure, you want to reject all application?', '', 'YES', 'NO').then(response => {
      if (response) {
        const applicationId = this.applicationList.map(function(application) {
          return application.applicationId;
        });
        if (applicationId.length > 0) {
          const requestObj: any = {
            applicationId: applicationId
          };
          this.tobService.rejectAllApplication(requestObj).subscribe((res) => {
            this.commonService.showAlert('Reject All Application', 'All applications have been rejected successfully.').then(resp => {
              if (resp) {
                this.initApiCalls();
              }
            });
          });
        } else {
          this.commonService.showAlert('Reject All Application', 'Only Applications except Accept status are rejected as all.');
        }
      }
    });
  }

  acceptApplication() {
    const isAccepted = this.applicationList.find((application) => application.status === APPLICATION_STATUSES.ACCEPTED);
    if (isAccepted) {
      this.commonService.showAlert('Accept Application', 'One application is already accepted, Please reject them first then accept this application.');
    } else {
      this.commonService.showConfirm('Accept Application', 'Are you sure, you want to accept this application?', '', 'YES', 'NO').then(response => {
        if (response) {
          this.tobService.updateApplicationStatus(this.selectedApplicationRow.applicationId, APPLICATION_STATUSES.ACCEPTED, {}).subscribe((response) => {
            this.commonService.showAlert('Accept Application', 'Application has been accepted successfully.').then(resp => {
              if (resp) {
                this.initApiCalls();
              }
            });
          });
        }
      });
    }
  }

  rejectApplication() {
    this.commonService.showConfirm('Reject Application', 'Are you sure, you want to reject this application?', '', 'YES', 'NO').then(response => {
      if (response) {
        this.tobService.updateApplicationStatus(this.selectedApplicationRow.applicationId, APPLICATION_STATUSES.REJECTED, {}).subscribe((res) => {
          this.commonService.showAlert('Reject Application', 'Application has been rejected successfully.').then(resp => {
            if (resp) {
              this.initApiCalls();
            }
          });
        });
      }
    });
  }

  holdApplication() {
    this.commonService.showConfirm('On Hold Application', 'Are you sure, you want to on hold this application?', '', 'YES', 'NO').then(response => {
      if (response) {
        this.tobService.updateApplicationStatus(this.selectedApplicationRow.applicationId, APPLICATION_STATUSES.ON_HOLD, {}).subscribe((res) => {
          this.commonService.showAlert('On Hold Application', 'Application status has been changed to on hold successfully.').then(resp => {
            if (resp) {
              this.initApiCalls();
            }
          });
        });
      }
    });
  }

  async markHoldingDepositPaid() {
    const modal = await this.modalController.create({
      component: HoldingDepositePaidModalPage,
      cssClass: 'modal-container modal-width tob-modal-container',
      componentProps: {
        heading: 'Holding Deposit Already Paid',
        offlinePaymentTypes: this.offlinePaymentTypes,
        propertyId: this.propertyId,
        selectedApplication: this.selectedApplicationRow
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(res => {
      if (res?.data?.holdingDepositePaid) {
        this.initApiCalls();
      }
    });
    await modal.present();
  }

  startReferencing() {
    if (this.referencingInfo.length === 1) {
      this.commonService.redirectUrl(this.referencingInfo[0].url);
    } else if (this.referencingInfo.length > 1) {
      this.selectReferecingType();
    } else {
      this.commonService.showAlert('Referencing', 'There is no referencing partner configured for this domain. Please contact support or an administrator.');
    }
  }

  viewDetails(applicantId: string) {
    this.hideMenu('', 'tob-application-overlay');
    this.router.navigate([`../application/${applicantId}`], { relativeTo: this.route });
  }

  private getReferancingInfo() {
    this.referencingInfodata = this.commonService.getItem(PROPCO.REFERENCING_INFO, true);
    if (this.referencingInfodata) {
      this.setReferancingInfoData();
    } else {
      this.commonService.getReferencingInfo().subscribe(data => {
        this.commonService.setItem(PROPCO.REFERENCING_INFO, data);
        this.setReferancingInfoData();
      });
    }
  }

  private setReferancingInfoData() {
    this.referencingInfodata = this.commonService.getItem(PROPCO.REFERENCING_INFO, true);
    this.referencingInfo = this.referencingInfodata.referencingPartners;
    this.prepareReferencingInfoData();
  }

  private async selectReferecingType() {
    const radioInput = [];
    this.referencingInfo.forEach(element => {
      radioInput.push({ label: element.label, type: 'radio', value: element.url });
    });

    this.commonService.showConfirm('Referencing', 'Please select referencing partner', '', '', '', radioInput).then(result => {
      this.commonService.redirectUrl(result);
    });
  }

  private prepareReferencingInfoData() {
    // add URL's here
    const prepareReferencingInfoData = [];
    this.referencingInfo.forEach(element => {
      switch (element) {
        case REFERENCING_TYPES.HOMELET:
          prepareReferencingInfoData.push({ name: element, label: 'Homelet', url: '' });
          break;
        case REFERENCING_TYPES.LETTINGS_HUB:
          prepareReferencingInfoData.push({ name: element, label: 'Lettings Hub', url: '' });
          break;
      }
    });
    this.referencingInfo = prepareReferencingInfoData;
  }

  onPaginateChange() {
    this.hideMenu('', 'tob-application-overlay');
  }

  private checkApplicationsAvailable() {
    this.isRecordsAvailable = (this.filteredApplicationList?.data.length > 0) ? true : false;
  }
}
