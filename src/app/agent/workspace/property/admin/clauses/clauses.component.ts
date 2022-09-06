import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, DEFAULTS, PROPERTY_CLAUSE_SCOPE } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-clauses',
  templateUrl: './clauses.component.html',
  styleUrls: ['./clauses.component.scss'],
})
export class ClausesComponent implements OnInit {
  propertyClauses = new FormControl('');
  propertyClausesList: any = [];
  localStorageItems: any;
  selectedEntityDetails: any;
  @ViewChild('propertyClausesFilter') propertyClausesFilter: IonicSelectableComponent;
  selectedClause: any;
  notAvailable = DEFAULTS.NOT_AVAILABLE;
  clausesHeadingList: any = [];

  constructor(private commonService: CommonService, private agentService: AgentService) { }

  ngOnInit() {
    this.initApi();
  }

  private async initApi() {
    this.localStorageItems = await this.fetchItems();
    this.selectedEntityDetails = await this.getActiveTabEntityInfo();
    this.clausesHeadingList = await this.getClausesHeadings();
    this.propertyClausesList = await this.getClauses();
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
      .set('clauseScope', PROPERTY_CLAUSE_SCOPE.PROPERTY);
    return new Promise((resolve) => {
      this.agentService.getPropertyClauses(propertyId, params).subscribe(
        (res: any) => {
          if (res && res.data) {
            this.propertyClauses.setValue(res?.data);
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
      .set('clauseScope', PROPERTY_CLAUSE_SCOPE.PROPERTY);
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

  private getClausesHeadings() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve) => {
      this.agentService.getClausesHeadings(params).subscribe(
        (res: any) => {
          resolve(res && res.data ? res.data : []);
        },
        (_error) => {
          resolve(false);
        }
      );
    });
  }

  removeClauses(selectedItem: any) {
    this.commonService.showConfirm('Remove Clause', 'Are you sure, you want to remove this clause ?', '', 'YES', 'NO').then(response => {
      if (response) {
        const index = this.propertyClauses.value.indexOf(selectedItem);
        if (index !== -1) {
          this.propertyClauses.value.splice(index, 1);
        }
        const selectedValue = this.propertyClauses.value;
        this.propertyClauses.reset();
        this.propertyClauses.setValue(selectedValue);
        if(this.selectedClause.clauseId === selectedItem.clauseId)
          this.selectedClause = '';
      }
    });
  }

  getClauseDetails(selectedItem: any) {
    this.selectedClause = selectedItem;
    if(this.clausesHeadingList.length > 0) {
      const clauseHeading = this.clausesHeadingList.filter((element: any) => element.clauseHeadingId === this.selectedClause.clauseHeadingId);
      if(clauseHeading.length > 0)
        this.selectedClause.clauseHeading = clauseHeading[0].clauseHeading;
    }
  }

  onSelectionChange() {
    const index = this.propertyClauses.value.indexOf(this.selectedClause);
    if(index === -1)
      this.selectedClause = '';
  }

  beginLoading() {
    this.commonService.showLoader();
  }

  endLoading() {
    this.commonService.hideLoader();
  }

  toggleItemsClauses() {
    this.propertyClausesFilter.toggleItems(this.propertyClausesFilter.itemsToConfirm.length ? false : true);
  }
}
