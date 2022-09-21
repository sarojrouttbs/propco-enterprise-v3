import { HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, NOTES_TYPE, PROPCO } from 'src/app/shared/constants';
import { NotesModalPage } from 'src/app/shared/modals/notes-modal/notes-modal.page';
import { PeriodicVisitModalPage } from '../property-modal/periodic-visit-modal/periodic-visit-modal.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-periodic-visit',
  templateUrl: './periodic-visit.component.html',
  styleUrls: ['./periodic-visit.component.scss'],
})

export class PeriodicVisitComponent implements OnInit, OnDestroy {

  dtOptions: any = {};
  notesDtOption: DataTables.Settings;
  notesDtTrigger: Subject<any> = new Subject();
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  visitList: any;
  localStorageItems: any;
  selectedEntityDetails: any;
  propertyDetails: any;
  activeLink: any;
  lookupdata: any;
  propertyVisitTypes: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  visitNotes = [];
  notesTypes: any;
  notesComplaints: any;
  notesCategories: any;
  inspectionStatuses: any;
  requirementForm: FormGroup;
  selectedData: any;
  isDisableAutoManagementInspection = new FormControl('false');
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private router: Router,
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.initPeriodicVisit();
  }

  private async initPeriodicVisit() {
    this.initForm();
    this.initApi();
    this.initDataTable();
    this.notesDtOption = this.buildDtOptions();
    this.getLookupData();
    setTimeout(() => {
      this.notesDtTrigger.next();
    }, 1000);
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyDetails = await this.getPropertyDetails(this.selectedEntityDetails.entityId);
    await this.getVisitHmoLicence(this.selectedEntityDetails.entityId);
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
        this.agentService.getVisitList(this.selectedEntityDetails.entityId, params).subscribe(res => {
          this.visitList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
          this.visitNotes = [];
          this.rerenderNotes();
        })
        this.hideMenu('', 'periodic-overlay');
      },
    };
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
      this.router.navigate([
        `agent/workspace/property/${item[0].entityId}/periodic-visit`,
      ]);
      this.activeLink = item[0].entityId;
      return item[0];
    }
  }

  private getPropertyDetails(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getPropertyDetails(propertyId, params).subscribe(
        (res) => {
          if (res && res.data) {
            this.requirementForm.get('visitsPerAnnum').setValue(res.data?.visitsPerAnnum);
            this.requirementForm.get('visitIntervalInMonths').setValue(res.data?.visitIntervalInMonths);
            this.requirementForm.get('visitSequenceStartDate').setValue(res.data?.visitSequenceStartDate);
            this.isDisableAutoManagementInspection.setValue(res.data?.propertyDetails?.isDisableAutoManagementInspection);
          }
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
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

  private setLookupData(data) {
    this.propertyVisitTypes = data.propertyVisitTypes;
    this.inspectionStatuses = data.inspectionStatuses;
    this.notesTypes = data.notesType;
    this.notesComplaints = data.notesComplaint;
    this.notesCategories = data.notesCategories;
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }

  initForm() {
    this.requirementForm = this.formBuilder.group({
      visitsPerAnnum: [''],
      visitsPerAnnumHMO: [{ value: '', disabled: true }],
      visitSequenceStartDate: [''],
      visitIntervalInMonths: [{ value: '', disabled: true }],
      visitIntervalInMonthsHMO: [{ value: '', disabled: true }]
    });
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
    this.hideMenu('', 'periodic-overlay');
    this.getVisitNotes(this.propertyDetails?.propertyId, data.visitId);
    this.visitList.forEach((e, i) => {
      if (e.visitId === data.visitId) { this.visitList[i].isSelected = true; }
      else { this.visitList[i].isSelected = false; }
    });
  }

  private getVisitNotes(propertyId: string, visitId: string) {
    const params = new HttpParams()
      .set('entityId', visitId)
      .set('entityType', NOTES_TYPE.MANAGEMENT_INSPECTION);
    this.agentService.getNotes(params).subscribe(res => {
      this.visitNotes = res && res.data ? res.data : [];
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

  showNoteDescription(noteText): void {
    if (noteText) {
      this.commonService.showAlert('Notes', noteText);
    }
  }

  async openVisitModal() {
    const modal = await this.modalController.create({
      component: PeriodicVisitModalPage,
      cssClass: 'modal-container property-modal-container',
      componentProps: {
        propertyVisitTypes: this.propertyVisitTypes,
        inspectionStatuses: this.inspectionStatuses
      },
      backdropDismiss: false
    });

    modal.onDidDismiss();
    await modal.present();
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, true);
  }

  hideMenu(event: any, id: any) {
    this.commonService.hideMenu(event, id);
  }

  getVisitHmoLicence(propertyId: string) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getVisitHmoLicence(propertyId, params).subscribe(
        (res) => {
          if (res && res.data) {
            this.requirementForm.get('visitsPerAnnumHMO').setValue(res.data?.visitsPerAnnumHMO);
            this.requirementForm.get('visitIntervalInMonthsHMO').setValue(res.data?.visitIntervalInMonthsHMO);
          }
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  async addNotes() {
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container property-modal-container',
      componentProps: {
        notesType: NOTES_TYPE.MANAGEMENT_INSPECTION,
        notesTypeId: this.selectedData.visitId,
        isAddNote: true,
        propertyId: this.propertyDetails?.propertyId
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res.data && res.data.noteId) {
        this.getVisitNotes(this.propertyDetails?.propertyId, this.selectedData.visitId);
      }
    });
    await modal.present();
  }

  ngOnDestroy() {
    // this.dtTrigger.unsubscribe();
    this.notesDtTrigger.unsubscribe();
  }
}
