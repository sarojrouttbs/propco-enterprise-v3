import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import {
  AGENT_WORKSPACE_CONFIGS,
  DEFAULT_MESSAGES,
} from "src/app/shared/constants";
import { CommonService } from "src/app/shared/services/common.service";
import { Property } from "./workspace.model";

@Injectable({
  providedIn: "root",
})
export class WorkspaceService {
  constructor(private commonService: CommonService, private router: Router) {}

  async addItemToWorkSpace(item: any) {
    switch (item.entityType) {
      case "PROPERTY":
        await this.setItemInWS(item);
        this.goToPropertyDashboard(item);
        break;

      default:
        this.commonService.showMessage(
          DEFAULT_MESSAGES.errors.SOMETHING_WENT_WRONG,
          "Error",
          "error"
        );
        break;
    }
  }

  private goToPropertyDashboard(item): void {
    this.router.navigate([
      `agent/workspace/property/${item.entityId}`,
    ]);
  }

  prepareTabData(item) {
    switch (item.entityType) {
      case "PROPERTY":
        let propData: Property = {} as Property;
        propData.entity = item.entityType;
        propData.entityId = item.entityId;
        propData.entityTitle = item.address;
        propData.reference = item.reference;
        propData.state = `/agent/workspace/property/${item.entityId}/dashboard`;
        propData.isSelected = true;
        return propData;
      default:
        break;
    }
  }

  private async setItemInWS(item) {
    let itemsInStorage = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    if (!itemsInStorage) {
      this.commonService.setItem(AGENT_WORKSPACE_CONFIGS.localStorageName, [
        this.prepareTabData(item),
      ]);
      return;
    } else {
      this.changeSelected(itemsInStorage, "isSelected", item.entityId);
      if (!this.checkIfEntityExistsInWS(item.entityId)) {
        this.commonService.removeItem(AGENT_WORKSPACE_CONFIGS.localStorageName);
        itemsInStorage.push(this.prepareTabData(item));
        this.commonService.setItem(
          AGENT_WORKSPACE_CONFIGS.localStorageName,
          itemsInStorage
        );
        return;
      }
    }
  }

  private checkIfEntityExistsInWS(entyityId: string) {
    let found;
    const arr = this.commonService.getItem(
      AGENT_WORKSPACE_CONFIGS.localStorageName,
      true
    );
    if (arr) {
      found = arr.some((el) => el.entityId === entyityId);
    }
    return found;
  }

  private changeSelected(arr, keyToUpdate, itemToSkip) {
    for (const obj of arr) {
      if (obj.entityId !== itemToSkip) {
        obj[keyToUpdate] = false;
      }
    }
  }
}
