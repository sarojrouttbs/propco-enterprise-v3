import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, NOTES_TYPE, PROPCO } from 'src/app/shared/constants';
import { NotesModalPage } from 'src/app/shared/modals/notes-modal/notes-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-safety-device',
  templateUrl: './safety-device.component.html',
  styleUrls: ['./safety-device.component.scss'],
})
export class SafetyDeviceComponent implements OnInit {

  localStorageItems: any;
  selectedEntityDetails: any;
  activeLink: any;
  safetyDeviceList: any;
  dtOptions: any = {};
  notesDtOption: DataTables.Settings;
  notesDtTrigger: Subject<any> = new Subject();
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  selectedData: any;
  lookupdata: any;
  notesTypes: any;
  notesComplaints: any;
  notesCategories: any;
  safetyDeviceNotes: any;
  safetyDeviceTypes: any;
  smokeDetectors: any;
  propertylookupdata: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private commonService: CommonService,
    private agentService: AgentService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.initApi();
    this.initDataTable();
    this.notesDtOption = this.buildDtOptions();
    this.getLookupData();
    this.getPropertyLookupData();
    setTimeout(() => {
      this.notesDtTrigger.next();
    }, 1000);
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
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
        this.agentService.getsafetyDeviceList(this.selectedEntityDetails.entityId, params).subscribe(res => {
          this.safetyDeviceList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
          this.safetyDeviceNotes = [];
          this.rerenderNotes();
        })
        this.hideMenu('', 'divOverlay');
      },
    };
  }

  showMenu(Event, id: string, data: any, className: string, isCard?: boolean) {
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

  hideMenu(event?: any, id?: any) {
    const $divOverlay = $('#' + id);
    $divOverlay.delay(200).slideUp('fast');
    if (event) {
      event.stopPropagation();
    }
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
    // this.getSafetyDeviceNotes(data.safetyDeviceId);
    this.safetyDeviceList.forEach((e, i) => {
      if (e.safetyDeviceId === data.safetyDeviceId) { this.safetyDeviceList[i].rowSelected = true; }
      else { this.safetyDeviceList[i].rowSelected = false; }
    });
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

  private getPropertyLookupData() {
    this.propertylookupdata = this.commonService.getItem(PROPCO.PROPERTY_LOOKUP_DATA, true);
    if (this.propertylookupdata) {
      this.setPropertyLookupData(this.propertylookupdata);
    }
    else {
      const params = new HttpParams().set("hideLoader", "true");
      this.commonService.getPropertyLookup(params).subscribe(data => {
        this.commonService.setItem(PROPCO.PROPERTY_LOOKUP_DATA, data);
        this.setPropertyLookupData(data);
      });
    }
  }

  private setPropertyLookupData(data: any): void {
    this.safetyDeviceTypes = data.safetyDeviceTypes;
    this.smokeDetectors = data.smokeDetectors;
  }

  private getSafetyDeviceNotes(safetyDeviceId) {
    const params = new HttpParams()
      .set('entityId', safetyDeviceId)
      .set('entityType', NOTES_TYPE.SAFETY_INSPECTIONS);
    this.agentService.getNotes(params).subscribe(res => {
      this.safetyDeviceNotes = res ? res : [];
      this.rerenderNotes();
    });
  }

  rerenderNotes(): void {
    if (this.dtElements && this.dtElements.last.dtInstance) {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.notesDtTrigger.next();
      });
    }
  }

  async addNotes() {    
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container property-modal-container',
      componentProps: {
        notesType: NOTES_TYPE.SAFETY_DEVICES,
        notesTypeId: this.selectedData.safetyDeviceId,
        isAddNote: true,
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data.noteId) {
        this.rerenderNotes();
      }
    });
    await modal.present();
  }

}