import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-tenant-list-modal',
  templateUrl: './tenant-list-modal.page.html',
  styleUrls: ['./tenant-list-modal.page.scss'],
})
export class TenantListModalPage implements OnInit {
  selected;
  toggled = false;
  constructor() { }

  ngOnInit() {
  }

}
