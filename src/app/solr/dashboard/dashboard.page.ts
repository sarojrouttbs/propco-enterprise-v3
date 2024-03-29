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
import { DomSanitizer } from '@angular/platform-browser';
declare function openScreen(key: string, value: any, existing: any): any;
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
  onlySearch = false;
  isFixedGrid = true;
  pageType = 'dashboard';
  isDashboardBannerPresent = false;
  dashboardBannerHtml;
  showDashboardBanner = false;

  constructor(
    private solrService: SolrService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private guidedTourService: GuidedTourService,
    private router: Router,
    private modalController: ModalController,
    private sanitizer: DomSanitizer
  ) {
    this.routeSnapShot = route.snapshot;
    if (this.router.url) {
      if (this.router.url.includes('/solr/search')) {
        this.onlySearch = true;
      } else if (this.router.url.includes('/solr/entity-finder')) {
        this.pageType = 'finder';
        let entityType = this.routeSnapShot.params['entityType'];
        if (entityType != null && entityType != '' && entityType != undefined) {
          this.entityControl = new FormControl([entityType]);
        }
        this.onlySearch = true;
      }
      if (this.router.url.includes('/solr/search') || this.router.url.includes('/solr/entity-finder') || this.router.url.includes('/solr/finder-results')) {
        this.isFixedGrid = false;
      }
    }
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
      this.commonService.setItem(PROPCO.SALES_MODULE, await this.getSystemConfigs(SYSTEM_CONFIG.ENABLE_SALES_MODULE));
      if (!this.onlySearch) {
        await this.getDashboardBanner();
        this.showBanner();
      }
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
      this.commonService.setItem(PROPCO.SALES_MODULE, await this.getSystemConfigs(SYSTEM_CONFIG.ENABLE_SALES_MODULE));
      if (!this.onlySearch) {
        await this.getDashboardBanner();
        this.showBanner();
      }
      this.setDefaultHome(true);
      const userDetail = await this.getUserDetailsPvt() as any;
      if (userDetail) {
        this.loggedInUserData = userDetail.data[0];
        this.commonService.setItem(PROPCO.USER_DETAILS, this.loggedInUserData);
        this.isSolrTourDone = this.loggedInUserData.isSolrTourDone;
        this.showTourGuide();
      } else {
        this.commonService.showMessage('Not able to fetch user details, Please contact support for further assistance.', 'User Details', 'error');
      }
      this.loaded = true;
    } else {
      this.router.navigate(['/sso-failure-page'], { replaceUrl: true });
    }
  }

  private async getSystemConfigs(key: string): Promise<any> {
    return new Promise((resolve) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(res != null && res[key] === '1' ? true : false);
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
          resolve(res);
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
    // const snapshot = this.route.snapshot;
    // const ssoKey = encodeURIComponent(snapshot.queryParams.ssoKey);
    // this.commonService.setItem(PROPCO.SSO_URL_ROUTE, this.router.url);
    // this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
    return new Promise((resolve, reject) => {
      let ssoKey = this.commonService.getItem(PROPCO.SSO_KEY);
      let accessToken = this.commonService.getItem(PROPCO.ACCESS_TOKEN);
      if (ssoKey && accessToken) {
        resolve(true);
      } else {
        resolve(false);
      }
      // this.solrService
      //   .authenticateSsoToken(ssoKey)
      //   .toPromise()
      //   .then(
      //     (response) => {
      //       this.isAuthSuccess = true;
      //       this.commonService.setItem(PROPCO.SSO_KEY, ssoKey);
      //       this.commonService.setItem(PROPCO.ACCESS_TOKEN, response.loginId);
      //       this.commonService.setItem(PROPCO.WEB_KEY, response.webKey);
      //       resolve(true);
      //     },
      //     (err) => {
      //       resolve(false);
      //     }
      //   );
    });
  }

  openHomeCategory(key: string, value = null, existing = false) {
    openScreen(key, value, existing);
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
      cssClass: 'modal-container entity-search entity-search-solrdashboard',
      backdropDismiss: false,
      componentProps: {
        isFAF: false,
        isSolrDashboard: true,
        types: types,
        solrPageTitle: solrPageTitle,
        cardType: cardType
      }
    });

    modal.onDidDismiss().then(res => {
      if (!res.data) {
        return;
      }
      else if (res.data.action === 'skip') {
        this.openHomeCategory(cardType);
        return;
      } else if (res.data.action === 'copy') {
        this.openHomeCategory(cardType, res.data.id);
      } else if (res.data.action === 'existing') {
        this.openHomeCategory(cardType, res.data.id, true);
      }
    });
    await modal.present();
  }

  private async getDashboardBanner() {
    let bannerContent = await this.getSolrBannerConfigs(SYSTEM_CONFIG.SOLR_BANNER);
    if (!bannerContent) {
      return;
    }
    this.isDashboardBannerPresent = true;
    this.dashboardBannerHtml = this.sanitizer.bypassSecurityTrustHtml(bannerContent);
    return;
  }

  private async getSolrBannerConfigs(key: string): Promise<any> {
    return new Promise((resolve) => {
      this.commonService.getSystemConfig(key).subscribe(res => {
        resolve(res != null && res[key] != null && res[key] != '' ? res[key] : false);
      }, error => {
        resolve(false);
      });
    });
  }

  private showBanner() {
    if (this.isDashboardBannerPresent) {
      this.showDashboardBanner = true;
    }
  }
}
