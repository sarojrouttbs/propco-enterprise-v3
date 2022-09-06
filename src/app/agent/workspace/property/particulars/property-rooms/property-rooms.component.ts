import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, PROPERTY_CLAUSE_SCOPE } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-property-rooms',
  templateUrl: './property-rooms.component.html',
  styleUrls: ['./property-rooms.component.scss'],
})
export class PropertyRoomsComponent implements OnInit {
  propertyRooms = new FormControl('');
  propertyRoomsList: any = [];
  localStorageItems: any;
  selectedEntityDetails: any;
  @ViewChild('PropertyRoomFilter') PropertyRoomFilter: IonicSelectableComponent;

  constructor(private commonService: CommonService, private agentService: AgentService) { }

  ngOnInit() {
    this.initApi();
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.propertyRoomsList = await this.getClauses();
    this.getPropertyClauses(this.selectedEntityDetails.entityId);
  }

  private fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getActiveTabEntityInfo() {
    const item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
  }

  private getPropertyClauses(propertyId: string) {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('clauseScope', PROPERTY_CLAUSE_SCOPE.ROOM);
    return new Promise((resolve) => {
      this.agentService.getPropertyClauses(propertyId, params).subscribe(
        (res: any) => {
          if (res && res.data) {
            this.propertyRooms.setValue(res?.data);
          }
          resolve(res?.data);
        },
        (_error) => {
          resolve(false);
        }
      );
    });
  }

  private getClauses() {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('clauseScope', PROPERTY_CLAUSE_SCOPE.ROOM);
    return new Promise((resolve) => {
      this.agentService.getClauses(params).subscribe(
        (res: any) => {
          resolve(res && res.data ? res.data : []);
        },
        (_error) => {
          resolve(false);
        }
      );
    });
  }

  removeRooms(selectedItem: any) {
    const index = this.propertyRooms.value.indexOf(selectedItem);
    if (index !== -1) {
      this.propertyRooms.value.splice(index, 1);
    }
    const selectedValue = this.propertyRooms.value;
    this.propertyRooms.reset();
    this.propertyRooms.setValue(selectedValue);
  }

  beginLoading() {
    this.commonService.showLoader();
  }

  endLoading() {
    this.commonService.hideLoader();
  }

  toggleItemsRooms() {
    this.PropertyRoomFilter.toggleItems(this.PropertyRoomFilter.itemsToConfirm.length ? false : true);
  }
}
