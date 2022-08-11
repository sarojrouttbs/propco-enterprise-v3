import { HttpParams } from '@angular/common/http';
import {
  Component,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Location } from '@angular/common';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import {
  ActivatedRoute,
  Router,
  RouterOutlet,
} from '@angular/router';
import {
  AGENT_WORKSPACE_CONFIGS,
  DEFAULT_MESSAGES,
} from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';
import { AgentService } from '../agent.service';
import { WorkspaceService } from './workspace.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.page.html',
  styleUrls: ['./workspace.page.scss'],
})
export class WorkspacePage {
  @ViewChild(MatTabGroup, { read: MatTabGroup })
  public tabGroup: MatTabGroup;
  @ViewChildren(MatTab, { read: MatTab })
  public tabNodes: QueryList<MatTab>;
  public closedTabs = [];
  skeleton: boolean = true;
  selectedEntityDetails: any = null;
  localStorageItems: any = [];
  activeLinkIndex = -1;
  @ViewChild(RouterOutlet) outlet: RouterOutlet;
  activeLink;
  DEFAULT_MESSAGES = DEFAULT_MESSAGES;
  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private workspaceService: WorkspaceService
  ) {
    route.params.subscribe((val) => {
      this.initWorkspace();
    });
    workspaceService.updatedWSItems$.subscribe(val => {
      this.localStorageItems = val;
    });
  }

  private async initWorkspace() {
    this.skeleton = true;
    this.localStorageItems = this.fetchItems();
    if (this.localStorageItems && this.localStorageItems.length > 0) {
      this.selectedEntityDetails = this.getActiveTabEntityInfo();
      await this.getEntityFullDetails();
    } else {
      this.router.navigate(['/agent'], { replaceUrl: true });
    }
    this.skeleton = false;
  }

  private  fetchItems() {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }

  private getActiveTabEntityInfo() {
    let item = this.localStorageItems.filter((x) => x.isSelected);
    if (item && item.length > 0) {
      this.router.navigate([
        `${item[0].state}`,
      ]);
      this.activeLink = item[0].reference;
      return item[0];
    }
  }

  async navigate(item) {
    await this.workspaceService.makeItemActive(item.entityId);
    this.router.navigate([
      item.state,
    ]);
  }

  private async getEntityFullDetails() {
    switch (this.selectedEntityDetails.entity) {
      case 'PROPERTY':
        let prop = await this.getPropertyById(
          this.selectedEntityDetails.entityId
        );
        if (prop) {
          this.selectedEntityDetails.fullDetails = prop;
        }
        break;

      default:
        break;
    }
  }

  async closeTab(index: number) {
    this.closedTabs.push(index);
    await this.workspaceService.removeItemByIndex(index);
    if (!this.workspaceService.isWorkspaceItemAvailable()) {
      this.router.navigate(['agent/dashboard'], { replaceUrl: true });
    } else {
      await this.workspaceService.activeNextTabOnDelete();
      this.router.navigate(['agent/workspace']).then(() => {
        window.location.reload();
      });
    }
  }

  getPropertyById(id) {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getPropertyById(id, params).subscribe(
        (res) => {
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  onSwitch(item) {
    switch (item.entity) {
      case 'PROPERTY':
        this.location.replaceState(item.state);
        break;

      default:
        break;
    }
  }
}
