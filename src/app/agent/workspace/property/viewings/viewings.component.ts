import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { DataTableDirective } from 'angular-datatables';
import { DATE_FORMAT, DATE_RANGE_CONFIG, DATE_RANGE_CONFIG_LIST } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-viewings',
  templateUrl: './viewings.component.html',
  styleUrls: ['./viewings.component.scss'],
})

export class ViewingsComponent implements OnInit {

  @Input() viewingInstructions;
  viewType = 'grid';
  viewings: any;
  dtOptions: any = {};
  @ViewChildren(DataTableDirective) dtElements: QueryList<DataTableDirective>;
  viewingsParams: any = new HttpParams();
  viewingForm: FormGroup;
  DATE_RANGE_CONFIG_LIST = DATE_RANGE_CONFIG_LIST;
  DATE_FORMAT = DATE_FORMAT;
  currentDate = new Date();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  popoverOptions: any = {
    cssClass: 'market-apprisal-ion-select'
  };
  constructor(
    private commonService: CommonService,
    private fb: FormBuilder
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.viewingInstructions && changes.viewingInstructions.currentValue) {
      this.viewingForm.get('viewingInstructions').setValue(this.viewingInstructions);
    }
  }

  ngOnInit() {
    this.initForm();
  }

  switchView(type) {
    this.viewType = type;
  }

  initForm() {
    this.viewingForm = this.fb.group({
      quickFilterType: [''],
      fromDate: [''],
      toDate: [''],
      viewingInstructions: ['']
    });
  }

  onFilterChange() {
    const selectedRange = this.viewingForm.value.quickFilterType;
    this.viewingForm.get('toDate').setValue(this.commonService.getFormatedDate(this.currentDate, this.DATE_FORMAT.YEAR_DATE));
    switch (selectedRange) {
      case DATE_RANGE_CONFIG.WEEK_TO_DATE:
        this.getFirstDayOfWeek(new Date())
        const firstDayOfWeek = this.getFirstDayOfWeek(new Date());
        this.viewingForm.get('fromDate').setValue(this.commonService.getFormatedDate(firstDayOfWeek, this.DATE_FORMAT.YEAR_DATE));
        break;
      case DATE_RANGE_CONFIG.MONTH_TO_DATE:
        const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        this.viewingForm.get('fromDate').setValue(this.commonService.getFormatedDate(firstDayOfMonth, this.DATE_FORMAT.YEAR_DATE));
        break;
      case DATE_RANGE_CONFIG.YEAR_TO_DATE:
        const firstDayOfYear = new Date(this.currentDate.getFullYear(), 0);
        this.viewingForm.get('fromDate').setValue(this.commonService.getFormatedDate(firstDayOfYear, this.DATE_FORMAT.YEAR_DATE));
        break;
      case DATE_RANGE_CONFIG.LAST_MONTH:
        const firstDayOfLastMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 0, 0);
        this.viewingForm.get('fromDate').setValue(this.commonService.getFormatedDate(firstDayOfLastMonth, this.DATE_FORMAT.YEAR_DATE));
        this.viewingForm.get('toDate').setValue(this.commonService.getFormatedDate(lastDayOfLastMonth, this.DATE_FORMAT.YEAR_DATE));
        break;
    }
  }

  private getFirstDayOfWeek(currentDate: Date) {
    const date = new Date(currentDate);
    const day = (date.getDay() + 1);
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  }

  applyFilter() {
    this.viewingsParams = this.viewingsParams.set('dateRange.from', this.viewingForm.value.fromDate ? this.commonService.getFormatedDate(this.viewingForm.value.fromDate, this.DATE_FORMAT.YEAR_DATE) : '');
    this.viewingsParams = this.viewingsParams.set('dateRange.to', this.viewingForm.value.toDate ? this.commonService.getFormatedDate(this.viewingForm.value.toDate, this.DATE_FORMAT.YEAR_DATE) : '');
  }

  resetFilter() {
    this.viewingForm.reset();
  }




}
