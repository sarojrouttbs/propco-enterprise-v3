import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgentService } from 'src/app/agent/agent.service';
import { DATE_FORMAT } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-compliance-records',
  templateUrl: './compliance-records.component.html',
  styleUrls: ['./compliance-records.component.scss'],
})
export class ComplianceRecordsComponent implements OnInit {
  @Input() propertyData;
  complianceForm: FormGroup;
  propertyInspection: any;
  currentDate = this.commonService.getFormatedDate(new Date(), DATE_FORMAT.YEAR_DATE);
  constructor(private fb: FormBuilder, private agentService: AgentService, private commonService: CommonService) { }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.propertyData && !changes.propertyData.firstChange) {
      this.getInspection(this.propertyData.propertyId);
    }
  }

  private initForm() {
    this.complianceForm = this.fb.group({
      hasLicence: '',
      hmoRisk: 'Not yet checked',
      expiry: 'Unknown'
    });
  }

  getInspection(propertyId) {
    let params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this.agentService.getInspection(propertyId, params).subscribe(
        (res) => {
          this.propertyInspection = res && res.data ? res.data[0] : '';
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }

}
