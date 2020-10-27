import { HttpParams } from '@angular/common/http';
import { PROPCO, REPORTED_BY_TYPES } from './../../shared/constants';
import { CommonService } from './../../shared/services/common.service';
import { FaultsService } from './../faults.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NotesModalPage } from '../../shared/modals/notes-modal/notes-modal.page';
import { EscalateModalPage } from '../../shared/modals/escalate-modal/escalate-modal.page';
import { ModalController } from '@ionic/angular';
import { async } from 'q';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;

  dtOptions: DataTables.Settings[] = [];
  dtTrigger: Subject<any> = new Subject();
  notesDtTrigger: Subject<any> = new Subject();
  faultList: any[];
  faultNotes: any[];
  selectedData: any;
  private lookupdata: any;
  faultCategories: any[];
  officeCodes: any[];
  faultStatuses: any[];
  faultUrgencyStatuses;
  notesCategories: any[];
  userLookupDetails: any[];
  notesComplaints: any[];
  notesTypes: any[];
  reportedByTypes = REPORTED_BY_TYPES;

  constructor(
    private commonService: CommonService,
    private modalController: ModalController,
    private router: Router,
    private faultsService: FaultsService) {
    this.getLookupData();
  }

  ngOnInit(): void {
    this.dtOptions[1] = this.buildDtOptions();
    const that = this;
    this.dtOptions[0] = {
      paging: true,
      pagingType: 'full_numbers',
      serverSide: true,
      processing: true,
      searching: false,
      ordering: false,
      pageLength: 10,
      ajax: (tableParams: any, callback) => {
        const params = new HttpParams()
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1');
        that.faultsService.getAllFaults(params).subscribe(res => {
          that.faultList = res && res.data ? res.data : [];
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
          this.faultNotes = [];
          this.rerenderNotes();
        })
      }
    };

    setTimeout(() => {
      this.notesDtTrigger.next();
    }, 1000);
  }

  ionViewDidEnter() {
    this.rerenderFaults(true);
    this.hideMenu('', 'divOverlay');
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
    this.faultCategories = data.faultCategories;
    this.officeCodes = data.officeCodes;
    this.faultStatuses = data.faultStatuses;
    this.faultUrgencyStatuses = data.faultUrgencyStatuses;

    this.notesCategories = data.notesCategories;
    this.userLookupDetails = data.userLookupDetails;
    this.notesComplaints = data.notesComplaint;
    this.notesTypes = data.notesType;
  }

  getLookupValue(index, lookup, type?) {
    index = (type == 'category' && index) ? Number(index) : index;
    return this.commonService.getLookupValue(index, lookup);
  }

  onClickRow(data, index?) {
    this.selectedData = data;
    this.getFaultNotes(this.selectedData.faultId);
  }

  private buildDtOptions(): DataTables.Settings {
    return {
      paging: true,
      searching: false,
      ordering: false
    };
  }

  private getFaultNotes(faultId) {
    this.faultsService.getFaultNotes(faultId).subscribe(res => {
      this.faultNotes = res && res.data ? res.data : [];
      this.rerenderNotes();
    });
  }

  public addFault() {
    this.router.navigate(['faults/add']);
  }

  async notesModal() {
    const modal = await this.modalController.create({
      component: NotesModalPage,
      cssClass: 'modal-container',
      componentProps: {
        notesType: 'fault',
        notesTypeId: this.selectedData.faultId,
        isAddNote: true
      },
      backdropDismiss: false
    });

    const data = modal.onDidDismiss().then(res => {
      if (res.data && res.data.noteId) {
        this.getFaultNotes(this.selectedData.faultId);
      }
    });
    await modal.present();
  }

  async escalateFault() {
    const headingText = 'Escalate Fault';
    const modal = await this.modalController.create({
      component: EscalateModalPage,
      cssClass: 'modal-container',
      componentProps: {
        heading: headingText,
        faultId: this.selectedData.faultId
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data == 'success') {
        this.commonService.showAlert('Escalate Fault', 'Fault has been escalated to the Property Manager');
        this.rerenderFaults(false);
        this.getFaultNotes(this.selectedData.faultId);
        this.hideMenu('', 'divOverlay');
      }
    });
    await modal.present();
  }

  async deEscalateFault() {
    this.commonService.showConfirm('De-Escalate Fault', 'Are you sure, you want to de-escalate the fault?', '', 'Yes', 'No').then(res => {
      if (res) {
        this.faultsService.deEscalateFault(this.selectedData.faultId, {}).subscribe(res => {
          this.rerenderFaults(false);
          this.hideMenu('', 'divOverlay');
        }, error => {
          // this.commonService.showMessage();
        });
      }
    })
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

  rerenderNotes(): void {
    if (this.dtElements && this.dtElements.last.dtInstance) {
      this.dtElements.last.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.notesDtTrigger.next();
      });
    }
  }

  rerenderFaults(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload((res) => { }, resetPaging);
      });
    }
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
    this.notesDtTrigger.unsubscribe();
  }

  goToFaultDetails() {
    this.router.navigate([`faults/${this.selectedData.faultId}/details`]);
  }

}
