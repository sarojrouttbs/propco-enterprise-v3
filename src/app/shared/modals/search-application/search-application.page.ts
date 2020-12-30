import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { Observable } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";
import { ReferencingService } from 'src/app/referencing/referencing.service';
import { REFERENCING } from "../../constants";

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

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private referencingService: ReferencingService,
  ) {
    this.initPropertySearchForm();
    this.filteredProperty = this.applicationSearchForm
      .get("text")
      .valueChanges.pipe(
        debounceTime(300),
        switchMap((value: string) =>
          value.length > 2
            ? new Observable((subscriber) =>
                subscriber.next(this.filterApplication(value))
              )
            : new Observable()
        )
      );
  }

  ngOnInit() {
    this.getApplicationList();
  }

  private filterApplication(value: string): string[] {
    return this.applicationList.filter(
      (option) => (option?.propertyDetail?.reference).indexOf(value) === 0
    );
  }

  initPropertySearchForm(): void {
    this.applicationSearchForm = this.fb.group({
      text: "",
    });
  }

  getApplicationList(): void {
    const params = new HttpParams();
    this.referencingService.getLAApplicationList(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, params).subscribe(
      (res) => {
        this.applicationList = res?.data;
        console.log(this.applicationList);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onSelectionChange(data) {
    if (data) {
      this.applicationId = data.option.value.applicationId;
      this.dismiss();
    }
  }

  dismiss() {
    this.modalController.dismiss({
      applicationId: this.applicationId,
      dismissed: true
    });
  }
}