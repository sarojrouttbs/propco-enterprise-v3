import { Component, Input, OnInit } from '@angular/core';
import { DATE_FORMAT } from '../../constants';

@Component({
  selector: 'app-close-fault',
  templateUrl: './close-fault.component.html',
  styleUrls: ['./close-fault.component.scss'],
})
export class CloseFaultComponent implements OnInit {
@Input() notificationData;
@Input() faultDetails;
@Input() action;
DATE_FORMAT = DATE_FORMAT;

  constructor() { }

  ngOnInit() {}

}
