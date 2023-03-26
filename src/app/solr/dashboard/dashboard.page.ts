import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PROPCO, SYSTEM_CONFIG } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { SolrService } from '../solr.service';
import { GuidedTourService } from 'ngx-guided-tour';
import {
  GuidedTour,
  Orientation,
} from '../../shared/interface/guided-tour.model';
import { SearchPropertyPage } from 'src/app/shared/modals/search-property/search-property.page';
import { ModalController } from '@ionic/angular';
declare function openScreen(key: string, value: any): any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardPage implements OnInit {
  loggedInUserData = null;
  isAuthSuccess = false;

  hideSuggestion = false;
  entityControl = new FormControl(['Property']);
  loaded = false;
  dashboardTour: GuidedTour = {
    tourId: 'solr-tour',
    useOrb: false,
    steps: [
      {
        title: 'Welcome to the New Dashboard',
        content:
          'Just getting started? Let\'s take a look at the new user interface.',
      },
      {
        title: 'New & Improved Search',
        selector: '.tour-1',
        content: 'Please select entities here.',
        orientation: Orientation.Bottom,
      },
      {
        title: 'New & Improved Search',
        selector: '.tour-2',
        content: 'Please type to search an entity.',
        orientation: Orientation.Bottom,
      },
      {
        title: 'New & Improved Search',
        selector: '.tour-3',
        content: 'Click on this button to fetch the result(s).',
        orientation: Orientation.Bottom,
      },
      {
        title: 'Quick Links',
        selector: '.tour-4',
        content: 'Click on these shortcuts to open frequently used functions.',
        orientation: Orientation.Top,
      },
    ],
    skipCallback: (stepSkippedOn: number) => {
      this.disableWelcomeTour();
    },
    completeCallback: () => {
      this.disableWelcomeTour();
    },
  };
  isSolrTourDone = false;
  private routeSnapShot;
  isCheckForExistingRecordsEnabled = false;


  constructor(
    private solrService: SolrService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private guidedTourService: GuidedTourService,
    private router: Router,
    private modalController: ModalController
  ) {
    this.routeSnapShot = route.snapshot;
  }

  ngOnInit() {
    this.initDashboard();
  }

  private initDashboard() {
    this.initApiCalls();
  }

  private async initApiCalls() {
    const accessToken = this.commonService.getItem(PROPCO.ACCESS_TOKEN);
    const webKey = this.commonService.getItem(PROPCO.WEB_KEY);
    const userData = this.commonService.getItem(PROPCO.USER_DETAILS, true);
    if (accessToken && webKey && userData) {
      this.isCheckForExistingRecordsEnabled = await this.getSystemConfigs(SYSTEM_CONFIG.ENABLE_CHECK_FOR_EXISTING_RECORDS);
      this.setDefaultHome(true);
      this.loggedInUserData = userData;
      this.isSolrTourDone = this.loggedInUserData.isSolrTourDone;
      this.showTourGuide();
      this.loaded = true;
      return;
    }
    const isAuthSuccess = await this.authenticateSso();
    if (isAuthSuccess) {
      this.isCheckForExistingRecordsEnabled = await this.getSystemConfigs(SYSTEM_CONFIG.ENABLE_CHECK_FOR_EXISTING_RECORDS);
      this.setDefaultHome(true);
      this.loggedInUserData = await this.getUserDetailsPvt();
      this.isSolrTourDone = this.loggedInUserData.isSolrTourDone;
      this.loaded = true;
      this.showTourGuide();
    } else {
      this.router.navigate(['/sso-failure-page'], { replaceUrl: true });
    }
  }

  private async getSystemConfigs(key: string): Promise<any> {
    return new Promise((resolve) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(res[key] === '1' ? true : false);
      }, error => {
        resolve(true);
      });
    });
  }

  private getUserDetailsPvt() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.commonService.getUserDetailsPvt(params).subscribe(
        (res) => {
          if (res) {
            this.commonService.setItem(PROPCO.USER_DETAILS, res.data[0]);
            resolve(res ? res.data[0] : null);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  private updateUserDetail(body: object) {
    return new Promise((resolve) => {
      this.solrService.updateUserDetails(body).subscribe(
        (res) => {
          if (res) {
            resolve(true);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  async setDefaultHome(enableNewHomeScreen: boolean) {
    await this.updateUserDetail({ enableNewHomeScreen });
  }

  private authenticateSso() {
    const snapshot = this.route.snapshot;
    const ssoKey = encodeURIComponent(snapshot.queryParams.ssoKey);
    this.commonService.setItem(PROPCO.SSO_URL_ROUTE, this.router.url);
    this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
    return new Promise((resolve, reject) => {
      this.solrService
        .authenticateSsoToken(ssoKey)
        .toPromise()
        .then(
          (response) => {
            this.isAuthSuccess = true;
            this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
            this.commonService.setItem(PROPCO.ACCESS_TOKEN, response.loginId);
            this.commonService.setItem(PROPCO.WEB_KEY, response.webKey);
            resolve(true);
          },
          (err) => {
            resolve(false);
          }
        );
    });
  }

  openHomeCategory(key: string, value = null) {
    openScreen(key, value);
  }


  private disableWelcomeTour() {
    const payload = {
      isSolrTourDone: true
    }
    const success = this.updateUserDetail(payload);
    if (success) {
      let userDataLocal = this.commonService.getItem(PROPCO.USER_DETAILS, true);
      userDataLocal.isSolrTourDone = true;
      this.commonService.setItem(PROPCO.USER_DETAILS, userDataLocal);
    }
  }

  showTourGuide() {
    if (!this.isSolrTourDone) {
      setTimeout(() => {
        this.guidedTourService.startTour(this.dashboardTour);
      }, 300);
    }
  }

  /** Duplicate Record Search */
  async searchEnity(cardType: string) {
    if (!this.isCheckForExistingRecordsEnabled) {
      if (cardType === 'OpenApplicantCard') {
        this.openHomeCategory('OpenApplicantCard');
        return;
      } else if (cardType === 'OpenMarketAppraisal') {
        this.openHomeCategory('OpenMarketAppraisal');
        return;
      }
    }
    let types;
    let solrPageTitle;
    if (cardType === 'OpenApplicantCard') {
      types = ['APPLICANT', 'TENANT', 'COTENANT'];
      solrPageTitle = 'New Applicant Card - Scan duplicates';
    } else if (cardType === 'OpenMarketAppraisal') {
      types = ['LANDLORD'];
      solrPageTitle = 'New Market Appraisal - Scan duplicates';
    }
    const modal = await this.modalController.create({
      component: SearchPropertyPage,
      cssClass: 'modal-container entity-search',
      backdropDismiss: false,
      componentProps: {
        isFAF: false,
        isSolrDashboard: true,
        types: types,
        solrPageTitle: solrPageTitle
      }
    });

    modal.onDidDismiss().then(res => {
      if (!res.data) {
        return;
      }
      else if (res.data === 'skip') {
        this.openHomeCategory(cardType);
        return;
      } else {
        this.openHomeCategory(cardType, res.data);
      }
    });
    await modal.present();
  }
}
