import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.page.html',
  styleUrls: ['./workspace.page.scss'],
})
export class WorkspacePage implements OnInit {
  constructor(){}
  ngOnInit(){}

  @ViewChild(MatTabGroup, {read: MatTabGroup})
  public tabGroup: MatTabGroup;
  @ViewChildren(MatTab, {read: MatTab})
  public tabNodes: QueryList<MatTab>;
  public closedTabs = [];
  public tabs = [
    {
      "state": "propco.agent.entity.property.dashboard",
      "params": {
        "#": null,
        "entityId": "51bb6bce-5e5f-1f63-815e-5faf63970013",
        "reference": "00000003",
        "entityTitle": "994 Huntingdon Street, Cartersville, CV35 3DW",
        "purpose": 1
      },
      "entityType": 1,
      "entityId": "51bb6bce-5e5f-1f63-815e-5faf63970013",
      "entity": "property",
      "entityTitle": "994 Huntingdon Street, Cartersville, CV35 3DW",
      "reference": "00000003",
      "isSelected": true
    },
    {
      "state": "propco.agent.entity.property.dashboard",
      "params": {
        "#": null,
        "entityId": "51bb6bce-5e5f-1f63-815e-5faf63a8001c",
        "reference": "00000004",
        "entityTitle": "132 Cambridge Lane, Cartersville, CV30 0DW",
        "purpose": 1
      },
      "entityType": 1,
      "entityId": "51bb6bce-5e5f-1f63-815e-5faf63a8001c",
      "entity": "property",
      "entityTitle": "132 Cambridge Lane, Cartersville, CV30 0DW",
      "reference": "00000004",
      "isSelected": false
    }
  ];

  closeTab(index: number) {
    this.closedTabs.push(index);
    this.tabGroup.selectedIndex = this.tabNodes.length - 1;
  }
}
