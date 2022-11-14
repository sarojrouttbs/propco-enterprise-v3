import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AGENT_WORKSPACE_CONFIGS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import menuList from '../../../../assets/data/menu.json';
import { WorkspaceService } from '../workspace.service';

@Component({
  selector: 'app-landlord',
  templateUrl: './landlord.page.html',
  styleUrls: ['./landlord.page.scss'],
})
export class LandlordPage implements OnInit  {
  showFiller = false;
  open = false;
  isExpanded = true;
  showSubmenu = false;
  isShowing = false;
  showSubSubMenu = false;
  landlordId: string;
  menuItems;
  screenWidth;
  showMenu = false;
  label = AGENT_WORKSPACE_CONFIGS.landlord.pageTitleMap['contact-info'];
  mode: string = 'side';
  agentMenu: any[] = menuList.landlord;
  constructor(
    private route: ActivatedRoute,
    private workspaceService: WorkspaceService,
    private router: Router,
    private commonService: CommonService
  ) {
    this.getPageWidthHeight();
    workspaceService.getActiveWSItem$.subscribe(val => {
      if (val) {
        this.label = val.pageRef;
      }
    });
  }

  ngOnInit() {
    this.menuItems = menuList.landlord;
    this.landlordId = this.route.snapshot.params['landlordId'];
    if (this.screenWidth > 1024) {
      setTimeout(() => {
        /** added timeout to open sidenav, On page load we will see a better way to do it */
        this.showMenu = true;
      }, 10);
    } else {
      this.mode = 'over';
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  getPageWidthHeight() {
    this.screenWidth = window.innerWidth;
  }

  setLabel(name: string) {
    this.label = name;
  }

  onResize(event) {
    this.screenWidth = event.target.innerWidth;
    if (this.screenWidth > 1024) {
      this.mode = 'side';
      this.showMenu = true;
    } else {
      this.mode = 'over';
      this.showMenu = false;
    }
  }

  workspaceSetActiveLink(route: string) {
    this.workspaceService.updateItemState(this.landlordId, route);
  }

  onShowSearchResultClick() {
    const solrSearchTerms = JSON.parse(this.commonService.getItem(PROPCO.SOLR_SERACH_TERMS));
    if(solrSearchTerms) {
      if (this.router.url.includes('/agent/')) {
        this.router.navigate(['/agent/solr/search-results'], {
          queryParams: solrSearchTerms.queryParams,
          replaceUrl: true
        });
      }
    } else {
      this.commonService.showMessage(DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'Error', 'error');
    }
  }
}
