import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  AGENT_WORKSPACE_CONFIGS,
  DEFAULT_MESSAGES,
} from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { LANDLORD, Property } from './workspace.model';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  updatedWSItems$ = new BehaviorSubject('');
  getActiveWSItem$ = new BehaviorSubject(this.getActiveWSItem());
  constructor(private commonService: CommonService, private router: Router) { }

  async addItemToWorkSpace(item: any) {
    switch (item.entityType) {
      case 'PROPERTY':
        await this.setItemInWS(item);
        this.goToPropertyDashboard(item);
        break;
      case 'LANDLORD':
        await this.setItemInWS(item);
        this.goToLandlordDashboard(item);
        break;

      default:
        this.commonService.showMessage(
          DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG,
          'Error',
          'error'
        );
        break;
    }
  }

  private goToPropertyDashboard(item): void {
    this.router
      .navigate([`agent/workspace/property/${item.entityId}/dashboard`])
      .then(() => {
        location.reload();
      });
  }

  private goToLandlordDashboard(item): void {
    this.router
      .navigate([`agent/workspace/landlord/${item.entityId}/contact-info`])
      .then(() => {
        location.reload();
      });
  }

  prepareTabData(item) {
    switch (item.entityType) {
      case 'PROPERTY':
        const propData: Property = {} as Property;
        propData.entity = item.entityType;
        propData.entityId = item.entityId;
        propData.entityTitle = item.address;
        propData.reference = item.reference;
        propData.state = `agent/workspace/property/${item.entityId}/dashboard`;
        propData.pageRef = AGENT_WORKSPACE_CONFIGS.property.pageTitleMap.dashboard;
        propData.isSelected = true;
        return propData;
      case 'LANDLORD':
        const landlordData: LANDLORD = {} as LANDLORD;
        landlordData.entity = item.entityType;
        landlordData.entityId = item.entityId;
        landlordData.entityTitle = item.fullName;
        landlordData.reference = item.reference;
        landlordData.state = `agent/workspace/landlord/${item.entityId}/contact-info`;
        landlordData.pageRef = AGENT_WORKSPACE_CONFIGS.landlord.pageTitleMap['contact-info'];
        landlordData.isSelected = true;
        return landlordData;
      default:
        break;
    }
  }

  private async setItemInWS(item) {
    const itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    if (!itemsInStorage) {
      this.commonService.setItem(AGENT_WORKSPACE_CONFIGS.localStorageName, [
        this.prepareTabData(item),
      ]);
      return;
    } else {
      const updatedList = await this.changeSelected(itemsInStorage, 'isSelected', item.entityId);
      if (!this.checkIfEntityExistsInWS(item.entityId)) {
        this.commonService.removeItem(AGENT_WORKSPACE_CONFIGS.localStorageName);
        itemsInStorage.push(this.prepareTabData(item));
        this.commonService.setItem(
          AGENT_WORKSPACE_CONFIGS.localStorageName,
          itemsInStorage
        );
        return;
      } else {
        /** Select the existing */
        this.commonService.removeItem(AGENT_WORKSPACE_CONFIGS.localStorageName);
        this.commonService.setItem(
          AGENT_WORKSPACE_CONFIGS.localStorageName,
          updatedList
        );
        return;
      }
    }
  }

  private checkIfEntityExistsInWS(entyityId: string) {
    let found: boolean;
    const arr = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    if (arr) {
      found = arr.some((el) => el.entityId === entyityId);
    }
    return found;
  }

  private async changeSelected(arr, keyToUpdate, itemToSkip) {
    for (const obj of arr) {
      if (obj.entityId !== itemToSkip) {
        obj[keyToUpdate] = false;
      }
      if (obj.entityId === itemToSkip) {
        obj[keyToUpdate] = true;
      }
    }
    return arr;
  }

  isWorkspaceItemAvailable(): boolean {
    let item: boolean = false;
    let itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    if (itemsInStorage && itemsInStorage.length > 0) {
      item = true;
    }
    return item;
  }

  async removeItemByIndex(index) {
    let itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    if (itemsInStorage) {
      this.commonService.removeItem(AGENT_WORKSPACE_CONFIGS.localStorageName);
      itemsInStorage.splice(index, 1);
      this.commonService.setItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        itemsInStorage
      );
      return;
    }
  }

  async activeNextTabOnDelete() {
    let itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    if (itemsInStorage) {
      itemsInStorage[0].isSelected = true;
      this.commonService.setItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        itemsInStorage
      );
      return;
    }
  }

  async makeItemActive(entityId: string) {
    let itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    for (const obj of itemsInStorage) {
      if (obj.entityId !== entityId) {
        obj['isSelected'] = false;
      } else {
        obj['isSelected'] = true;
      }
    }
    this.commonService.setItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      itemsInStorage
    );
    this.getActiveWSItem$.next(this.getActiveWSItem());
    return;
  }

  async updateItemState(entityId: string, newState: string) {
    let itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    for (const obj of itemsInStorage) {
      if (obj.entityId === entityId) {
        obj.state = `agent/workspace/property/${entityId}/${newState}`;
        obj.pageRef = AGENT_WORKSPACE_CONFIGS.property.pageTitleMap[newState];
      }
    }
    this.commonService.setItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      itemsInStorage
    );
    this.setUpdatedWSItems();
    return;
  }

  private setUpdatedWSItems() {
    let itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    this.updatedWSItems$.next(itemsInStorage);
    this.getActiveWSItem$.next(this.getActiveWSItem());
  }

  private getActiveWSItem() {
    let itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    if (itemsInStorage && itemsInStorage.length > 0) {
      const item = itemsInStorage.filter((x) => x.isSelected);
      if (item && item.length > 0) {
        return item[0];
      }
    }
  }
}
