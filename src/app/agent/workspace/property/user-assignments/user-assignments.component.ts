import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AGENT_WORKSPACE_CONFIGS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-assignments',
  templateUrl: './user-assignments.component.html',
  styleUrls: ['./user-assignments.component.scss'],
})
export class UserAssignmentsComponent implements OnInit {
  authKey;
  webKey;
  propertyid;
  url;
  localStorageItems: any = [];
  showIframe = false;
  constructor(public sanitizer: DomSanitizer, private commonService: CommonService) {
    
  }

  private fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  ngOnInit() {
    this.init();
  }
  private async init() {
    this.localStorageItems = await this.fetchItems();
    const item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      this.authKey = this.commonService.getItem('access_token');
      this.webKey = this.commonService.getItem('web_key');
      this.propertyid = item[0].entityId;
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.FLUTTER_HOST_URL}property/user-assignments?authkey=${this.authKey}&webkey=${this.webKey}&propertyid=${this.propertyid}`);
      this.showIframe = true;
    }
  }
}
