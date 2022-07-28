import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { HttpParams } from '@angular/common/http';
import { HmrcService } from 'src/app/hmrc/hmrc.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { TodoItemFlatNode, TodoItemNode } from './office-filter-modal.model';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-office-filter-modal',
  templateUrl: './office-filter-modal.page.html',
  styleUrls: ['./office-filter-modal.page.scss']
})

export class OfficeFilterModalPage implements OnInit {
  // input variables to modal
  preSelectedRegion;
  preSelectedOfficeList;

  searchText = new FormControl();
  filteredOfficesList: any = [];
  officesList: any = [];
  groupOfficesList: any = [];
  groupOfficesDetails: any;
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);
  get data(): TodoItemNode[] { return this.dataChange.value; }
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true); /* true for multiple */

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): Observable<TodoItemNode[]> => observableOf(node.children);

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  constructor(private modalController: ModalController, private hmrcService: HmrcService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
    this.searchText.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.filteredOfficesList = this.officesList.filter(item =>
          item?.officeName?.toLowerCase().includes(searchTerm)
        );
      });
    this.filteredOfficesList = [...this.officesList];
  }

  ngOnInit() {
    this.initAPI();
  }

  private async initAPI() {
    const data = this.buildFileTree(this.groupOfficesList?.items, 0);
    // Notify the change.
    this.dataChange.next(data);
    this.populatePreSelectRegions();
  }

  buildFileTree(obj: object, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      const selectedDefinationObj = this.groupOfficesList.definition.filter((obj) => value.groupDefinitionId === obj.groupDefinitionId);
      node.item = value.name;
      node.groupOfficeId = value.groupOfficeId;
      node.groupOfficeCode = value.groupOfficeCode;
      node.groupDefinitionId = selectedDefinationObj[0].groupDefinitionId;
      node.groupDefinitionType = selectedDefinationObj[0].name;
      if (value !== null) {
        if (typeof value === 'object') {
          if (value.items.length !== 0) {
            node.children = this.buildFileTree(value.items, level + 1);
          }
        }
      }
      return accumulator.concat(node);
    }, []);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  onSave() {
    const selectedOfficeList = this.officesList.filter((obj) => obj.isChecked);
    this.modalController.dismiss({ selectedOfficeList: selectedOfficeList, selectedRegion: this.checklistSelection.selected });
  }

  selectOffice(tenant: any, event: any) {
    tenant.isChecked = event.checked;
  }

  private populatePreSelectRegions() {
    this.treeControl.dataNodes.forEach((element) => {
      const isPreviousChecked = this.preSelectedRegion.filter((obj) => obj.groupOfficeId === element.groupOfficeId);
      if (isPreviousChecked.length > 0) {
        this.checklistSelection.select(element);
        this.treeControl.expand(element);
      }
    });
    this.onCheckBoxClick();
  }

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
    const selectedDefinationObj = this.groupOfficesList.definition.filter((obj) => node.groupDefinitionId === obj.groupDefinitionId);
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    flatNode.groupOfficeId = node.groupOfficeId;
    flatNode.groupOfficeCode = node.groupOfficeCode;
    flatNode.groupDefinitionId = selectedDefinationObj[0].groupDefinitionId;
    flatNode.groupDefinitionType = selectedDefinationObj[0].name;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);
    if (currentLevel < 1) {
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;
    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];
      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  async onCheckBoxClick() {
    const groupOfficeIdsList = this.checklistSelection.selected.map((obj) => obj.groupOfficeId);
    if (groupOfficeIdsList.length > 0) {
      this.officesList = await this.getOfficesList(groupOfficeIdsList) as [];
      this.officesList.forEach(element => {
        const isPreviousCheckedOffice = this.preSelectedOfficeList.filter((obj) => obj.officeId === element.officeId);
        if (isPreviousCheckedOffice.length > 0) {
          element.isChecked = true;
        }
      });
    } else {
      this.officesList = [];
    }
    this.filteredOfficesList = [...this.officesList];
  }

  private getOfficesList(groupOfficeIdsList: any) {
    const params = new HttpParams()
      .set('parentGroupOfficeIds', groupOfficeIdsList);
    return new Promise((resolve, _reject) => {
      this.hmrcService.getOffices(params).subscribe(
        (res) => {
          const responseData = res ? res.data : [];
          responseData.forEach((item) => {
            const data = this.officesList.filter(element => element.officeId === item.officeId);
            if (data[0]?.isChecked) {
              item.isChecked = true;
            } else {
              item.isChecked = false;
            }
          });
          resolve(responseData);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

  onExpandAll() {
    this.treeControl.expandAll();
  }

  onCollapseAll() {
    this.treeControl.collapseAll();
  }

  onselectAll() {
    if (this.officesList) {
      this.officesList.forEach((item) => {
        item.isChecked = true;
      });
    }
  }

  unselectAll() {
    if (this.officesList) {
      this.officesList.forEach((item) => {
        item.isChecked = false;
      });
    }
  }
}