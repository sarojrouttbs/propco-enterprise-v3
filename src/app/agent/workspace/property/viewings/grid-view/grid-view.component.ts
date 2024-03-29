import { HttpParams } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
})
export class GridViewComponent implements OnInit, OnDestroy {

  viewingsParams = new HttpParams();
  viewingList = [];
  DATE_FORMAT = DATE_FORMAT;
  pageEvent: PageEvent;
  pageIndex = 0;
  public pageSize = 10;
  selectedItem: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  localStorageItems: any;
  selectedEntityDetails: any;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  length: number;
  gridSubscription: Subscription;

  constructor(
    private el: ElementRef<HTMLElement>,
    private agentService: AgentService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initApi();
  }

  async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.gridSubscription = this.agentService.updateResetFilter.subscribe(res => {
      if (res?.isFilter) {
        this.viewingsParams = this.viewingsParams.set('startDateRange.from', res.from ? this.commonService.getFormatedDate(res.from, this.DATE_FORMAT.YEAR_DATE) : '');
        this.viewingsParams = this.viewingsParams.set('startDateRange.to', res.to ? this.commonService.getFormatedDate(res.to, this.DATE_FORMAT.YEAR_DATE) : '');
        this.getViewings();
      } else if (!res?.isFilter) {
        this.viewingsParams = this.viewingsParams.delete('startDateRange.from');
        this.viewingsParams = this.viewingsParams.delete('startDateRange.to');
        this.getViewings();
      }
    });
    this.getViewings();
  }

  private fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getActiveTabEntityInfo() {
    const item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
  }

  private getViewings() {
    this.agentService.getViewings(this.selectedEntityDetails.entityId, this.viewingsParams).subscribe(res => {
      this.viewingList = res && res.data ? res.data : [];
      this.length = res && res.count ? res.count : 0;
      this.agentService.updateCount(this.length);
      this.customizePaginator();
    })
  }


  private customizePaginator(): void {
    setTimeout(() => {
      const lastBtn = this.el.nativeElement.querySelector(
        '.mat-paginator-navigation-last'
      );
      if (lastBtn) {
        lastBtn.innerHTML = 'Last';
      }
      const firstBtn = this.el.nativeElement.querySelector(
        '.mat-paginator-navigation-first'
      );
      if (firstBtn) {
        firstBtn.innerHTML = 'First';
      }

      const perPage = this.el.nativeElement.querySelector(
        '.mat-paginator-page-size-label'
      );
      if (perPage) {
        perPage.innerHTML = 'Per page';
      }
    }, 100);
  }

  public handlePage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.getViewings();
    return e;
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedItem = data;
    const baseContainer = $(event.target).parents('.' + className);
    const divOverlay = $('#' + id);
    const baseContainerWidth = baseContainer.outerWidth(true) - 130;
    const baseContainerHeight = baseContainer.outerHeight(true) - 10;
    const baseContainerPosition = baseContainer.position();
    const baseContainerTop = baseContainerPosition.top + 5;
    const divOverlayLeft = baseContainerPosition.left + 125;

    divOverlay.css({
      position: 'absolute',
      top: baseContainerTop,
      right: '10px',
      width: baseContainerWidth,
      height: baseContainerHeight,
      left: divOverlayLeft,
      padding: '10px',
      paddingRight: '15px',
      borderTopRightRadius: '4px',
      borderBottomRightRadius: '4px'
    });

    divOverlay.delay(200).slideDown('fast');
    event.stopPropagation();
  }

  hideMenu(event: any, id: any) {
    this.commonService.hideMenu(event, id);
  }

  ngOnDestroy() {
    this.gridSubscription.unsubscribe();
  }
}
