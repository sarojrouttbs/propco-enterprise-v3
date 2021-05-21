import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-close-fault',
  templateUrl: './close-fault.component.html',
  styleUrls: ['./close-fault.component.scss'],
})
export class CloseFaultComponent implements OnInit {
@Input() notificationData;
@Input() faultDetails;
@Input() action;
  constructor() { }

  ngOnInit() {}

}
