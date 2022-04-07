import { HttpParams } from "@angular/common/http";
import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { Location } from '@angular/common';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import {
  ActivatedRoute,
  ActivationStart,
  Router,
  RouterOutlet,
} from "@angular/router";
import { AGENT_WORKSPACE_CONFIGS } from "src/app/shared/constants";
import { CommonService } from "src/app/shared/services/common.service";
import { AgentService } from "../agent.service";
import { MenuController } from "@ionic/angular";

@Component({
  selector: "app-workspace",
  templateUrl: "./workspace.page.html",
  styleUrls: ["./workspace.page.scss"],
})
export class WorkspacePage implements OnInit {
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

  constructor(
    private agentService: AgentService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private menu: MenuController
  ) {
    this.openFirst();
    this.openCustom();
    route.params.subscribe((val) => {
      this.initWorkspace();
    });
  }

  ngOnInit() {}
  private async initWorkspace() {
    this.skeleton = true;
    this.localStorageItems = this.fetchItems();
    this.selectedEntityDetails = this.getActiveTabEntityInfo();
    await this.getEntityFullDetails();
    this.skeleton = false;
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
    let item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      this.router.navigate([
        `agent/workspace/property/${item[0].entityId}/dashboard`,
      ]);
      this.activeLink = item[0].entityId;
      return item[0];
    }
  }

  private async getEntityFullDetails() {
    switch (this.selectedEntityDetails.entity) {
      case "PROPERTY":
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

  closeTab(index: number) {
    this.closedTabs.push(index);
    this.tabGroup.selectedIndex = this.tabNodes.length - 1;
  }

  getPropertyById(id) {
    let params = new HttpParams().set("hideLoader", "true");
    const promise = new Promise((resolve, reject) => {
      this.agentService.getPropertyById(id, params).subscribe(
        (res) => {
          resolve(res.data);
        },
        (error) => {
          resolve(false);
        }
      );
    });
    return promise;
  }
  onSwitch(item) {
    console.log(item)
    switch (item.entity) {
      case 'PROPERTY':
        this.location.replaceState(item.state);
        break;
    
      default:
        break;
    }
  }

  openFirst() {
    this.menu.enable(true, 'first');
    this.menu.open('first');
  }

  openEnd() {
    this.menu.open('end');
  }

  openCustom() {
    this.menu.enable(true, 'custom');
    this.menu.open('custom');
  }
}
