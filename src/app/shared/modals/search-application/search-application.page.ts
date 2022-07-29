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

  referencingProductList: any;
  referencingCaseProductList: any[] = [];
  referencingApplicationProductList: any[] = [];
  
  referencingApplicantStatusTypes: any[] = [];
  referencingApplicantResultTypes: any[] = [];

  isNotFound = false;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private referencingService: ReferencingService,
    public commonService: CommonService,

  ) {
    this.initPropertySearchForm();
    this.filteredProperty = this.applicationSearchForm.get('text').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value.length > 2) ? this.searchApplication(value) : new Observable())
    );
  }

  ngOnInit() {
    this.getLookupData();
    this.getProductList();
  }

  private searchApplication(value: any): Observable<any> {
    this.isNotFound = false;
    let response = this.referencingService.getApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE,
      new HttpParams()
        .set('limit', '10')
        .set('page', '1')
        .set('searchTerm', value));
    response.subscribe(res => {
      this.isNotFound = res && res?.data.length > 0 ? false : true;
    },
      error => {
        console.log(error);
      }
    );
    return response;
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
    this.referencingProductList = this.commonService.getItem(PROPCO.REFERENCING_PRODUCT_LIST, true);
    if (this.referencingProductList) {
      this.referencingCaseProductList = this.referencingProductList?.caseProducts ? this.referencingProductList.caseProducts : [];
      this.referencingApplicationProductList = this.referencingProductList?.applicationProducts ? this.referencingProductList.applicationProducts : [];
    }
    else{
      return new Promise((resolve) => {
        this.referencingService.getProductList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE).subscribe(
          res => {
            this.referencingProductList = res ? res : {};
            
            if (this.referencingProductList) {
              this.commonService.setItem(PROPCO.REFERENCING_PRODUCT_LIST, res);
              this.referencingCaseProductList = this.referencingProductList?.caseProducts ? this.referencingProductList.caseProducts : [];
              this.referencingApplicationProductList = this.referencingProductList?.applicationProducts ? this.referencingProductList.applicationProducts : [];
            }
            resolve(this.referencingProductList);
          },
          error => {
            console.log(error);
            resolve(this.referencingProductList);
        });
      });
    }
  }

  private initPropertySearchForm(): void {
    this.applicationSearchForm = this.fb.group({
      text: "",
    });
  }

  onSelectionChange(data: any) {
    if (data) {
      this.applicationId = data.option.value.applicationId;
      this.dismiss();
    }
  }

  getProductType(productId: any, name: any): string{
    let productType: any;
    if(name == 'case'){
      this.referencingCaseProductList.find((obj) => {
        if (obj.productId === productId) {
          productType = obj.productName;
        }
      });
    }
    else if(name == 'application'){
      this.referencingApplicationProductList.find((obj) => {
        if (obj.productId === productId) {
          productType = obj.productName;
        }
      });
    }
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