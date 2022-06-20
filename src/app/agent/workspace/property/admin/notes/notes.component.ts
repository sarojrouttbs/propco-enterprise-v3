import { HttpParams } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, NOTES_TYPE, PROPCO } from 'src/app/shared/constants';
import { NotesModalPage } from 'src/app/shared/modals/notes-modal/notes-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {

  notes: any;
  dtOptions: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  notesCategories: any;
  notesComplaints: any;
  notesTypes: any;
  lookupdata: any;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  notAvailable = DEFAULTS.NOT_AVAILABLE
  localStorageItems: any;
  selectedEntityDetails: any;
  category = new FormControl('');
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  notesParams: any = new HttpParams();
  selectedData: any;
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.initApi();
    this.initDataTable();
  }

  async initApi() {
    this.getLookupData();
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
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
    this.notesCategories = data.notesCategories;
    this.notesComplaints = data.notesComplaint;
    this.notesTypes = data.notesType;
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
        this.notesParams = this.notesParams
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set('hideLoader', 'true')
          .set('entityId', this.selectedEntityDetails.entityId)
          .set('entityType', NOTES_TYPE.PROPERTY);
        this.agentService.getNotes(this.notesParams).subscribe(res => {
          this.notes = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        })
        this.hideMenu('', 'divOverlay');
      },
      language: {
        processing: '<ion-spinner name="dots"></ion-spinner>'
      }
    };
  }

  async addNotes() { 
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container property-modal-container',
      componentProps: {
        notesType: NOTES_TYPE.PROPERTY,
        notesTypeId: this.selectedEntityDetails.entityId,
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

  onCategoryChange(e) {
    this.notesParams = this.notesParams.set('category', e.detail.value);
    this.rerenderNotes();
  }

  private rerenderNotes(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }

  showNoteDescription(noteText: string): void {
    if (noteText) {
      this.commonService.showAlert('Notes', noteText);
    }
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, true);
  }

  hideMenu(event: any, id: any) {
    this.commonService.hideMenu(event, id);
  }
}
