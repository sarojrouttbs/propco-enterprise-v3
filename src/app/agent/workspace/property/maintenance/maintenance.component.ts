import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DEFAULTS, DEFAULT_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.scss'],
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  dtOptions: any = {};
  notesDtOption: DataTables.Settings;
  localStorageItems: any = [];
  selectedEntityDetails: any = null;
  maintenanceList: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  notesDtTrigger: Subject<any> = new Subject();
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  maintenanceNotes: any;
  selectedData: any;
  lookupdata: any;
  notesTypes: any;
  notesComplaints: any;
  notesCategories: any;
  expenditureLimit = new FormControl('');
  propertyDetails: any;
  
  constructor(private commonService: CommonService, private agentService: AgentService) { }

  ngOnInit() {
    this.initMaintenance();
  }

  private initMaintenance() {
    this.getLookupData();
    this.initApi();
    this.initDataTable();
    this.notesDtOption = this.buildDtOptions();
    setTimeout(() => {
      this.notesDtTrigger.next();
    }, 100);
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
  }

  private initDataTable(): void {
    this.dtOptions = {
      paging: true,
      pagingType: 'full_numbers',
      serverSide: true,
      processing: true,
      searching: false,
      ordering: false,
      pageLength: 5,
      lengthMenu: [5, 10, 15],
      autoWidth: true,
      responsive: true,
      ajax: (tableParams: any, callback) => {
        let params = new HttpParams()
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set('hideLoader', 'true');
        this.agentService.getPropertyMaintenance(this.selectedEntityDetails.entityId, params).subscribe(res => {
          let maintenanceList = res && res.data ? res.data : [];
          this.maintenanceList = maintenanceList;
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
        this.hideMenu('', 'divOverlay');
      },
      language: {
        processing: 'Loading...'
      }
    };
  }

  private buildDtOptions(): DataTables.Settings {
    return {
      paging: true,
      searching: false,
      ordering: false,
      responsive: true,
      lengthMenu: [5, 10, 15],
      pageLength: 5,
    };
  }

  onClickRow(data: any) {
    this.hideMenu('', 'divOverlay');
    this.selectedData = data;
    this.getMaintenanceNotes(this.selectedData.maintenanceId);
    this.maintenanceList.forEach((e, i) => {
      if (e.maintenanceId === data.maintenanceId) this.maintenanceList[i].isSelected = true;
      else this.maintenanceList[i].isSelected = false;
    });
  }

  private getMaintenanceNotes(maintenanceId: string) {
    this.agentService.getMaintenanceNotes(maintenanceId).subscribe(res => {
      this.maintenanceNotes = res && res.data ? res.data : [];
      this.rerenderNotes();
    });
  }

  private rerenderNotes(): void {
    if (this.dtElements && this.dtElements.last.dtInstance) {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.notesDtTrigger.next();
      });
    }
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
    let item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
  }

  private getLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }
  }

  private setLookupData(data: any) {
    this.notesTypes = data.notesType;
    this.notesComplaints = data.notesComplaint;
    this.notesCategories = data.notesCategories;
  }

  showNoteDescription(noteText: string): void {
    if (noteText) {
      this.commonService.showAlert('Notes', noteText);
    }
  }

  showMenu(event, id, data, className, isCard?) {
    this.selectedData = data;
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

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyById(propertyId, params).subscribe(
        (res) => {
          if (res && res.data) {
            this.expenditureLimit.setValue(res.data?.expenditureLimit);
          }
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }

  ngOnDestroy() {
    this.notesDtTrigger.unsubscribe();
  }
}
