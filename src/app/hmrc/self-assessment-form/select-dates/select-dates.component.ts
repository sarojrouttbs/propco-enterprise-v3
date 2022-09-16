import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DATE_FORMAT, HMRC } from 'src/app/shared/constants';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-select-dates',
  templateUrl: './select-dates.component.html',
  styleUrls: ['./select-dates.component.scss'],
})
export class SelectDatesComponent implements OnInit {
  @Input() group: FormGroup;
  dateFilterList = [];
  popoverOptions: any = {
    cssClass: 'hmrc-ion-select'
  };
  DATE_FORMAT = DATE_FORMAT;

  constructor(
    public datepipe: DatePipe,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getDateFilterList();
  }

  onFilterChange(index: string) {
    if (!index) return;
    const value = this.dateFilterList.find(x => x.index === index);
    if (!value) return;
    const splittedValue = value.index.split(',');
    this.group.controls.from.setValue(this.datepipe.transform(splittedValue[0], this.DATE_FORMAT.YEAR_DATE));
    this.group.controls.to.setValue(this.datepipe.transform(splittedValue[1], this.DATE_FORMAT.YEAR_DATE));
  }

  getDateFilterList() {
    let fromDate = new Date(HMRC.START_DATE);
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - fromDate.getFullYear();
    for (let i = 1; i <= yearDiff; i++) {
      const year = fromDate.getFullYear();
      const month = fromDate.getMonth();
      const day = fromDate.getDate();
      const toDate = new Date(year + 1, month, day - 1);
      const date = new Date(year + 1, month, day);

      const fromYear = fromDate.getFullYear();
      const toYear = fromDate.getFullYear() + 1;

      const obj: any = {
        index: this.commonService.getFormatedDate(fromDate) + ',' + this.commonService.getFormatedDate(toDate),
        value: fromYear + '-' + toYear
      }
      this.dateFilterList.push(obj)
      fromDate = new Date(this.commonService.getFormatedDate(date));
    }
  }

}
