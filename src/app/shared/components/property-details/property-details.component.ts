import { PROPCO } from './../../constants';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss', '../../drag-drop.scss'],
})
export class PropertyDetailsComponent implements OnInit {
  @Input() propertyDetails;
  @Input() parentForm: FormGroup;
  @Input() files;
  @Input() hmoDetails;
  @Input() urgencyStatus;
  @Input() faultId;
  @Input() createdAt;
  lookupdata: any;
  @Output()
  getUploadedFile = new EventEmitter<any>();
  advertisementRentFrequencies: any[];
  officeCodes: any[];
  hmoLicenceSchemes: any[];
  faultUrgencyStatuses: any[];

  constructor(public commonService: CommonService) {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData();
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.setLookupData();
      });
    }

  }

  ngOnInit() {
  }

  private setLookupData() {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.advertisementRentFrequencies = this.lookupdata.advertisementRentFrequencies;
    this.officeCodes = this.lookupdata.officeCodes;
    this.hmoLicenceSchemes = this.lookupdata.hmoLicenceSchemes;
    this.faultUrgencyStatuses = this.lookupdata.faultUrgencyStatuses;
  }

  getLookupValue(index, lookup) {
    return this.commonService.getLookupValue(index, lookup);
  }
  public submit(files: FileList) {
    this.getUploadedFile.emit(files);
  }
}
