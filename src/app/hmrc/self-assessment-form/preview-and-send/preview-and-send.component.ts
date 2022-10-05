import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, ENTITY_TYPE, HMRC_CONFIG, HMRC_ERROR_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { HmrcService } from '../../hmrc.service';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/shared/services/common.service';
import { ModalController } from '@ionic/angular';
import { PreviewPdfModalPage } from '../../hmrc-modals/preview-pdf-modal/preview-pdf-modal.page';
import { AddressPipe } from 'src/app/shared/pipes/address-string-pipe.pipe';
import { WorkspaceService } from 'src/app/agent/workspace/workspace.service';
import { Router } from '@angular/router';
import { SimpleModalPage } from 'src/app/shared/modals/simple-modal/simple-modal.page';
declare function openScreen(key: string, value: any): any;

@Component({
  selector: 'app-preview-and-send',
  templateUrl: './preview-and-send.component.html',
  styleUrls: ['./preview-and-send.component.scss'],
})
export class PreviewAndSendComponent implements OnInit {

  @Input() group: FormGroup;
  @Input() systemConfig;
  dtOption: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtTrigger: Subject<any> = new Subject();
  params: any = new HttpParams();
  landlordList: any;
  totalPropertyLandlord = 0;
  lookupdata: any;
  statementPreferences: any;
  selectedLandlords: number[] = [];
  unSelectedLandlords: number[] = [];
  emailPattern = HMRC_CONFIG.EMAIL_REGEX;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;

  @Output() onHmrcLandlordSelectPreview = new EventEmitter<any>();
  selectedData: any;

  constructor(
    private hmrcService: HmrcService,
    public datepipe: DatePipe,
    private commonService: CommonService,
    private modalController: ModalController,
    private router: Router,
    private workspaceService: WorkspaceService
  ) { }

  ngOnInit() {
    this.getLookupData();
    this.initDataTable();
    this.disableButton();
    this.selectedLandlords = this.group.value.selectedPropertyLinkIds;
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
    this.statementPreferences = data.statementPreferences;
  }

  private initDataTable(): void {
    this.dtOption = {
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
        this.params = this.params
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set('taxHandler', this.systemConfig)
          .set('hideLoader', 'true');
        if (this.group.value.selectedPropertyOfficeCodes)
          this.params = this.params.set('propertyOffice', this.group.value.selectedPropertyOfficeCodes);
        if (this.group.value.selectedManagementType)
          this.params = this.params.set('managementType', this.group.value.selectedManagementType);
        if (this.group.value.searchText)
          this.params = this.params.set('searchText', this.group.value.searchText);
        if (this.group.value.searchOnColumns)
          this.params = this.params.set('searchOnColumns', this.group.value.searchOnColumns)
        if (this.group.value.selectedPropertyLinkIds)
          this.params = this.params.set('selectedPropertyLinkIds', this.group.value.selectedPropertyLinkIds.toString());
        if (this.group.value.deselectedPropertyLinkIds)
          this.params = this.params.set('deselectedPropertyLinkIds', this.group.value.deselectedPropertyLinkIds.toString());
        this.hmrcService.getLandlords(this.params).subscribe(res => {
          this.landlordList = res && res.data ? res.data : [];
          this.totalPropertyLandlord = res ? res.count : 0;
          this.landlordList.forEach(item => {
            item.checked = this.unSelectedLandlords.indexOf(item.propertyLinkId) >= 0 ? false : true;
            item.isDisabled = false;
            if (item.landlordEmail && !item.landlordEmail.match(this.emailPattern)) {
              if (item.statementPreference &&
                item.statementPreference === 3) {
                item.checked = true;
                item.isDisabled = true;
                item.invalid = true;
              } else {
                item.checked = false;
                this.unSelectedLandlords.push(item.propertyLinkId);
                if (this.selectedLandlords)
                  this.selectedLandlords.splice(this.selectedLandlords.indexOf(item.propertyLinkId), 1);
                item.isDisabled = true;
                item.invalid = true;
              }
            }
          });
          callback({
            recordsTotal: res ? res.count : 0,
            recordsFiltered: res ? res.count : 0,
            data: []
          });
        }, (_error) => {
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.FACING_PROBLEM_TO_FETCH_DETAILS, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
        })
      }
    };
  }

  onCheckboxChange(e: any) {
    if (e.detail.checked) {
      this.selectedLandlords.push(e.detail.value);
      this.unSelectedLandlords.splice(this.unSelectedLandlords.indexOf(e.detail.value), 1);
    } else {
      this.unSelectedLandlords.push(e.detail.value);
      this.selectedLandlords.splice(this.selectedLandlords.indexOf(e.detail.value), 1);
    }
    if (this.selectedLandlords.length > 0)
      this.group.get('selectedPropertyLinkIds').setValue(this.selectedLandlords);
    if (this.unSelectedLandlords.length > 0)
      this.group.get('deselectedPropertyLinkIds').setValue(this.unSelectedLandlords);
    this.disableButton();
  }

  private disableButton() {
    if (this.unSelectedLandlords.length > 0 && this.unSelectedLandlords.length === this.totalPropertyLandlord)
      this.onHmrcLandlordSelectPreview.emit('false');
    else
      this.onHmrcLandlordSelectPreview.emit('true');
  }

  async onRowClick(data: any) {
    const respData: any = await this.getPdfUrlDetails(data);
    if (!respData)
      return;
    const file = new Blob([respData], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    const modal = await this.modalController.create({
      component: PreviewPdfModalPage,
      cssClass: 'modal-container preview-pdf-modal-container',
      componentProps: {
        modalHeader: 'HMRC Report',
        pdfUrl: fileURL
      },
      backdropDismiss: false
    });

    modal.onDidDismiss();
    await modal.present();
  }

  private getPdfUrlDetails(data: any) {
    const requestObj = {
      financialYearDateRange: {
        from: this.group.value.from,
        to: this.group.value.to
      },
      selfAssessmentRequest: [
        {
          landlordId: data.landlordId,
          propertyIds: [
            data.propertyId
          ]
        }
      ]
    };
    return new Promise((resolve) => {
      this.hmrcService.getPdfUrlDetails(requestObj).subscribe(
        (res) => {
          resolve(res ? res : {});
        },
        (_error) => {
          this.commonService.showMessage(HMRC_ERROR_MESSAGES.PREVIEW_PDF_ERROR, DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG, 'error');
          resolve(false);
        }
      );
    });
  }

  onPreferenceChange() {
    this.params = this.params.set('statementPreference', this.group.value.statementPreference);
    this.rerenderLandlordList();
  }

  private rerenderLandlordList(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload(resetPaging);
      });
    }
  }

  showMenu(event: any, id: any, data: any, className: any) {
    this.selectedData = data;
    this.commonService.showMenu(event, id, className, true);
  }

  hideMenu(event: any, id: any) {
    this.commonService.hideMenu(event, id);
  }

  onClick(entityType: any) {
    this.hideMenu('', 'preview-and-send-overlay');
    if (this.router.url.includes('/agent/')) {
      this.gotoWorkSpaceV3(entityType);
      return;
    }

    /*Navigate to java fx page (If solr loads inside v2)*/
    this.gotoWorkSpaceV2(entityType);
  }

  private gotoWorkSpaceV2(entityType: any) {
    let action;
    switch (entityType) {
      case ENTITY_TYPE.PROPERTY:
        action = 'OpenProperty';
        openScreen(action, this.selectedData?.propcoPropertyId);
        break;
      case ENTITY_TYPE.LANDLORD:
        action = 'OpenLandlord';
        openScreen(action, this.selectedData?.propcoLandlordId);
        break;
      default:
        return;
    }
  }

  private gotoWorkSpaceV3(entityType: any) {
    let action;
    switch (entityType) {
      case ENTITY_TYPE.PROPERTY:
        this.constructPropertyEntityData(entityType);
        this.workspaceService.addItemToWorkSpace(this.selectedData);
        break;
      case ENTITY_TYPE.LANDLORD:
        this.openItemUnderDevelopmentModal();
        break;
      default:
        return;
    }
  }

  private constructPropertyEntityData(entityType: any) {
    const addressPipe = new AddressPipe();
    const addressStr = addressPipe.transform(this.selectedData.propertyAddress);
    this.selectedData.entityType = entityType;
    this.selectedData.entityId = this.selectedData.propertyId;
    this.selectedData.reference = this.selectedData.propertyReference;
    this.selectedData.address = addressStr;
  }

  private async openItemUnderDevelopmentModal() {
    const modal = await this.modalController.create({
      component: SimpleModalPage,
      cssClass: 'modal-container alert-prompt',
      backdropDismiss: false,
      componentProps: {
        data: `${DEFAULT_MESSAGES.UNDER_DEVELOPMENT}`,
        heading: 'Workspace',
        buttonList: [
          {
            text: 'OK',
            value: false,
          },
        ],
      },
    });
    await modal.present();
  }
}
