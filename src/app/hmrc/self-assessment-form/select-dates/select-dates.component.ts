import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DATE_FORMAT, HMRC } from 'src/app/shared/constants';

@Component({
  selector: 'app-select-dates',
  templateUrl: './select-dates.component.html',
  styleUrls: ['./select-dates.component.scss'],
})
export class SelectDatesComponent implements OnInit {
  @Input() group:FormGroup;
  hmrcConfigs = HMRC;
  popoverOptions: any = {
    cssClass: 'hmrc-ion-select'
  };
  DATE_FORMAT = DATE_FORMAT;
  constructor() {
  }

  ngOnInit() { }

  onFilterChange(index: string) {
    if (!index) return;
    const value = this.hmrcConfigs.QUICK_DATE_FILTERS.find(x => x.index === index);
    if (!value) return;
    const splittedValue = value.index.split(',');
    this.group.controls.from.setValue(splittedValue[0]);
    this.group.controls.to.setValue(splittedValue[1]);
  }

}
