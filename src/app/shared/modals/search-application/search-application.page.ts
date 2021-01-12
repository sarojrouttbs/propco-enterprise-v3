import { PlatformLocation } from "@angular/common";
import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ModalController, NavParams } from "@ionic/angular";
import { Observable } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";
import { ReferencingService } from 'src/app/referencing/referencing.service';
import { REFERENCING, PROPCO } from "../../constants";
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-search-application',
  templateUrl: './search-application.page.html',
  styleUrls: ['./search-application.page.scss'],
})
export class SearchApplicationPage implements OnInit {
  applicationSearchForm: FormGroup;
  applicationList: any;
  filteredProperty: Observable<any>;
  applicationId: any;

  lookupdata: any;
  referencingLookupdata: any;

  referencingProductList: any[] = [];
  referencingApplicantStatusTypes: any[] = [];
  referencingApplicantResultTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private referencingService: ReferencingService,
    private location: PlatformLocation,
    public commonService: CommonService,

  ) {
    this.initPropertySearchForm();
    this.filteredProperty = this.applicationSearchForm.get('text').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value.length > 2) ? this.referencingService
      .getApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, 
        new HttpParams()
        .set('limit', '10')
        .set('page', '1')
        .set('searchTerm', value)) : new Observable())
    );
    location.onPopState(() => this.dismiss());
  }

  ngOnInit() {
    this.getLookupData();
    this.getProductList();
  }

  private getLookupData(): void {
    this.lookupdata = this.commonService.getItem(PROPCO.LOOKUP_DATA, true);
    this.referencingLookupdata = this.commonService.getItem(PROPCO.REFERENCING_LOOKUP_DATA, true);
    if (this.lookupdata) {
      this.setLookupData(this.lookupdata);
    } else {
      this.commonService.getLookup().subscribe(data => {
        this.commonService.setItem(PROPCO.LOOKUP_DATA, data);
        this.lookupdata = data;
        this.setLookupData(data);
      });
    }

    if (this.referencingLookupdata) {
      this.setReferencingLookupData(this.referencingLookupdata);
    } else {
      this.referencingService.getLookupData(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(data => {
        this.commonService.setItem(PROPCO.REFERENCING_LOOKUP_DATA, data);
        this.referencingLookupdata = data;
        this.setReferencingLookupData(data);
      });
    }
  }

  private setLookupData(data: any): void {
  }

  private setReferencingLookupData(data: any): void {
    this.referencingApplicantStatusTypes = data.applicantStatusTypes;
    this.referencingApplicantResultTypes = data.applicantReferencingResultTypes;
  }

  private getProductList() {
    const promise = new Promise((resolve, reject) => {
      this.referencingService.getProductList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(
        res => {
          this.referencingProductList = res ? res : [];
          resolve(this.referencingProductList);
        },
        error => {
          console.log(error);
          resolve(this.referencingProductList);
      });
    });
    return promise;
  }

  initPropertySearchForm(): void {
    this.applicationSearchForm = this.fb.group({
      text: "",
    });
  }

  onSelectionChange(data) {
    if (data) {
      this.applicationId = data.option.value.applicationId;
      this.dismiss();
    }
  }

  getProductType(productId: any): string{
    let productType: any;
    this.referencingProductList = this.referencingProductList && this.referencingProductList.length ? this.referencingProductList : [];
    this.referencingProductList.find((obj) => {
      if (obj.productId === productId) {
        productType = obj.productName;
      }
    });
    return productType;
  }

  getLookupValue(index: any, lookup: any, type?: any) {
    return this.commonService.getLookupValue(index, lookup);
  }

  dismiss() {
    this.modalController.dismiss({
      applicationId: this.applicationId,
      dismissed: true
    });
  }
}