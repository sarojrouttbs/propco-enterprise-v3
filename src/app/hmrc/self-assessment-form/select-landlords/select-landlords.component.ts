import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { DATE_FORMAT, DEFAULTS, DEFAULT_MESSAGES, HMRC, HMRC_ERROR_MESSAGES, PROPCO } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { HmrcService } from '../../hmrc.service';
import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { OfficeFilterModalPage } from '../../hmrc-modals/office-filter-modal/office-filter-modal.page';
import { ModalController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
@Component({
  selector: 'app-select-landlords',
  templateUrl: './select-landlords.component.html',
  styleUrls: ['./select-landlords.component.scss'],
})
export class SelectLandlordsComponent implements OnInit {
  dtOptions: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  dtTrigger: Subject<any> = new Subject();
  landlordList: any;
  @Input() group: FormGroup;
  @Input() systemConfig;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  DEFAULTS = DEFAULTS;
  DATE_FORMAT = DATE_FORMAT;
  lookupdata: any;
  officeCodes: any;
  managementTypes: any;
  landlordParams: any = new HttpParams();
  checkedLandlords: number[] = [];
  uncheckedLandlords: number[] = [];
  gridCheckAll = false;
  hmrcConfigs = HMRC;
  totalPropertyLandlord = 0;
  selectedPropertyLandlordCount = 0;
  popoverOptions: any = {
    cssClass: 'hmrc-ion-select ion-select-auto'
  };
  @Output() onHmrcLandlordSelect = new EventEmitter<any>();
  isGroupOfficeFilter = false;
  officesList: any = [];
  selectedRegion = [];
  selectedOfficeList = [];
  groupOfficesList: any = [];

  @ViewChild('ManagementTypeFilter') ManagementTypeFilter: IonicSelectableComponent;
  @ViewChild('OfficeFilter') OfficeFilter: IonicSelectableComponent;

  selectedManagementType: number[] = [];
  selectedOfficeCode = [];

  constructor(
    private hmrcService: HmrcService,
    private commonService: CommonService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.initAPI();
    this.dtOptions = this.initDataTable();
    setTimeout(() => {
      this.dtTrigger.next();
    }, 100);
  }

  private async initAPI() {
    this.getLookupData();
    this.officesList = await this.getOfficesList();
    const optionsResponse: any = await this.getOptions();
    if (optionsResponse.ENABLE_GROUPOFFICEFILTER) {
      this.isGroupOfficeFilter = true;
      this.groupOfficesList = await this.getOfficesGroupList();
    } else {
      this.isGroupOfficeFilter = false;
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
    this.officeCodes = data.officeCodes;
    this.managementTypes = data.managementTypes;
  }

  private initDataTable(): DataTables.Settings {
    return {
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
        this.landlordParams = this.landlordParams
          .set('limit', tableParams.length)
          .set('page', tableParams.start ? (Math.floor(tableParams.start / tableParams.length) + 1) + '' : '1')
          .set('taxHandler', this.systemConfig)
          .set('hideLoader', 'true');
        this.hmrcService.getLandlords(this.landlordParams).subscribe(res => {
          this.landlordList = res && res.data ? res.data : [];
          this.totalPropertyLandlord = res ? res.count : 0;
          this.landlordList.forEach(item => {
            item.checked = this.isLandlordChecked(item.propertyLinkId);
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

  private rerenderLandlordList(resetPaging?): void {
    if (this.dtElements && this.dtElements.first.dtInstance) {
      this.dtElements.first.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload(resetPaging);
      });
    }
  }

  onselectAll() {
    this.checkedLandlords.length = 0;
    this.gridCheckAll = true;
    this.getRows(true);
    this.selectedPropertyLandlordCount = this.totalPropertyLandlord;
    this.onHmrcLandlordSelect.emit('true');
  }

  unselectAll() {
    this.uncheckedLandlords.length = 0;
    this.gridCheckAll = false;
    this.getRows(false);
    this.selectedPropertyLandlordCount = 0;
    this.onHmrcLandlordSelect.emit('false');
  }

  private isLandlordChecked(propertyLinkId: number) {
    if (!this.gridCheckAll) {
      return this.checkedLandlords.indexOf(propertyLinkId) >= 0 ? true : false;
    } else {
      return this.uncheckedLandlords.indexOf(propertyLinkId) >= 0 ? false : true;
    }

    if (this.gridCheckAll) {
      return this.checkedLandlords.indexOf(propertyLinkId) >= 0 ? false : true;
    } else {
      return this.uncheckedLandlords.indexOf(propertyLinkId) >= 0 ? true : false;
    }
  }

  private getRows(selected: boolean) {
    this.dtElements.first.dtInstance.then((dtInstance: any) => {
      const elements = [];
      $('td', dtInstance.table(0).node()).find('ion-checkbox');
      const checkboxElement = $('td', dtInstance.table(0).node()).find('ion-checkbox');
      elements.push(checkboxElement)
      const temp = elements[0]
      for (const item of temp) {
        if (!selected) {
          if (item.checked) {
            item.checked = false;
          }
        } else {
          item.checked = true;
        }
      };
    });
  }

  applyFilters() {
    this.unselectAll();
    this.landlordParams = this.landlordParams
      .delete('propertyOffice')
      .delete('managementType')
      .delete('searchText')
      .delete('searchOnColumns');

    if (this.checkedLandlords.length > 0)
      this.checkedLandlords.length = 0;
    if (this.group.value.selectedPropertyOfficeCodes)
      this.landlordParams = this.landlordParams.set('propertyOffice', this.group.value.selectedPropertyOfficeCodes);
    if (this.group.value.managementType)
      this.landlordParams = this.landlordParams.set('managementType', this.selectedManagementType);
    if (this.group.value.searchText && this.group.value.searchText.trim() && this.group.value.searchText.length > 2) {
      this.landlordParams = this.landlordParams.set('searchText', this.group.value.searchText);
      if (this.group.value.searchOnColumns)
        this.landlordParams = this.landlordParams.set('searchOnColumns', this.group.value.searchOnColumns);
    }
    this.rerenderLandlordList();
  }

  resetFilters() {
    this.unselectAll();
    this.landlordParams = new HttpParams();
    this.group.reset();
    this.group.markAsUntouched();
    this.rerenderLandlordList();
    this.selectedRegion = [];
    this.selectedOfficeList = [];
    this.checkedLandlords.length = 0;
    this.uncheckedLandlords.length = 0;
  }

  onCheckboxClick(checkboxVal: any) {
    const isChecked: any = document.getElementById('checkbox_' + checkboxVal).getAttribute('aria-checked');
    if (isChecked === 'true') {
      this.checkedLandlords.splice(this.checkedLandlords.indexOf(checkboxVal), 1);
      this.uncheckedLandlords.push(checkboxVal);
      this.selectedPropertyLandlordCount -= 1;
    } else {
      this.uncheckedLandlords.splice(this.uncheckedLandlords.indexOf(checkboxVal), 1);
      this.checkedLandlords.push(checkboxVal);
      this.selectedPropertyLandlordCount += 1;
    }

    if (this.gridCheckAll && this.uncheckedLandlords.length > 0)
      this.group.get('deselectedPropertyLinkIds').patchValue(this.uncheckedLandlords);

    if (!this.gridCheckAll && this.checkedLandlords.length > 0)
      this.group.get('selectedPropertyLinkIds').patchValue(this.checkedLandlords);

    if ((this.gridCheckAll &&
      ((this.uncheckedLandlords.length > 0
        && this.uncheckedLandlords.length != this.totalPropertyLandlord
      ) || this.checkedLandlords.length > 0))
      || (!this.gridCheckAll && this.checkedLandlords.length > 0))
      this.onHmrcLandlordSelect.emit('true');
    else this.onHmrcLandlordSelect.emit('false');
  }

  async onOfficeClick() {
    const modal = await this.modalController.create({
      component: OfficeFilterModalPage,
      cssClass: 'modal-container office-filter-modal-container',
      componentProps: {
        preSelectedRegion: this.selectedRegion,
        preSelectedOfficeList: this.selectedOfficeList,
        groupOfficesList: this.groupOfficesList
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then(async res => {
      if (res && res?.data) {
        this.selectedOfficeList = res?.data?.selectedOfficeList;
        this.selectedRegion = res?.data?.selectedRegion;
        const propertyOfficeName = res?.data?.selectedOfficeList.map(err => err.officeName).join(', ');
        const propertyOfficeCodes = res?.data?.selectedOfficeList.map(err => err.officeCode);
        this.group.get('propertyOffice').setValue(propertyOfficeName);
        this.group.get('selectedPropertyOfficeCodes').patchValue(propertyOfficeCodes);
      }
    });
    await modal.present();
  }

  private getOptions() {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('option', 'ENABLE_GROUPOFFICEFILTER');
    return new Promise((resolve) => {
      this.hmrcService.getOptions(params).subscribe(
        async (res) => {
          resolve(res ? res : {});
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  private getOfficesList() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.hmrcService.getOffices(params).subscribe(
        (res) => {
          resolve(res ? res.data : []);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  private getOfficesGroupList() {
    return new Promise((resolve) => {
      this.hmrcService.getOfficesGroup().subscribe(
        (res) => {
          resolve(res ? res : {});
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  beginLoading() {
    this.commonService.showLoader();
  }

  endLoading() {
    this.commonService.hideLoader();
  }

  toggleItems() {
    this.ManagementTypeFilter.toggleItems(this.ManagementTypeFilter.itemsToConfirm.length ? false : true);
  }

  onManagementChange() {
    this.selectedManagementType.length = 0;
    if (this.group.value.managementType) {
      for (let val of this.group.value.managementType) {
        this.selectedManagementType.push(val.index);
      }
    }
    this.group.get('selectedManagementType').patchValue(this.selectedManagementType);
  }

  toggleItemsOffice() {
    this.OfficeFilter.toggleItems(this.OfficeFilter.itemsToConfirm.length ? false : true);
  }

  onOfficeChange() {
    this.selectedOfficeCode.length = 0;
    if (this.group.value.propertyOfficeCodes) {
      for (let val of this.group.value.propertyOfficeCodes) {
        this.selectedOfficeCode.push(val.officeCode);
      }
    }
    this.group.get('selectedPropertyOfficeCodes').patchValue(this.selectedOfficeCode);
  }
}
