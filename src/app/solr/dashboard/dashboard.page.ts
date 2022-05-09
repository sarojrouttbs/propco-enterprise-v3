import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { SolrService } from '../solr.service';
import { GuidedTourService } from 'ngx-guided-tour';
import {
  GuidedTour,
  Orientation,
} from '../../shared/interface/guided-tour.model';
import { ThemeService } from 'src/app/shared/services/theme.service';
declare function openScreen(key: string, value: any): any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardPage implements OnInit {
  loggedInUserData;
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

  constructor(
    private solrService: SolrService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private guidedTourService: GuidedTourService,
    private theme: ThemeService
  ) {
    this.theme.activeTheme('light-theme');
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
    if (accessToken && webKey) {
      this.loaded = true;
      return;
    }
    const isAuthSuccess = await this.authenticateSso();
    if (isAuthSuccess) {
      this.loggedInUserData = await this.getUserDetails();
      this.loaded = true;
      if (!this.commonService.getItem('disableTour')) {
        setTimeout(() => {
          this.guidedTourService.startTour(this.dashboardTour);
        }, 300);
      }
    }
  }

  private getUserDetails() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this.solrService.getUserDetails(params).subscribe(
        (res) => {
          resolve(res ? res.data[0] : '');
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  private authenticateSso() {
    const snapshot = this.route.snapshot;
    const ssoKey = encodeURIComponent(snapshot.queryParams.ssoKey);
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
            // resolve(true);
            reject(false);
          }
        );
    });
  }

  openHomeCategory(key: string, value = null) {
    openScreen(key, value);
  }

  private disableWelcomeTour() {
    this.commonService.setItem('disableTour', true);
  }
}
