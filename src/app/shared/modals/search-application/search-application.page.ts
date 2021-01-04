import { PlatformLocation } from "@angular/common";
import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ModalController, NavParams } from "@ionic/angular";
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
    private location: PlatformLocation,

  ) {
    this.initPropertySearchForm();
    this.filteredProperty = this.applicationSearchForm.get('text').valueChanges.pipe(debounceTime(300),
      switchMap((value: string) => (value.length > 2) ? this.referencingService.searchApplicationByText(REFERENCING.LET_ALLIANCE_REFERENCING_TYPE, value) : new Observable())
    );
    location.onPopState(() => this.dismiss());
  }

  ngOnInit() {
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

  dismiss() {
    this.modalController.dismiss({
      applicationId: this.applicationId,
      dismissed: true
    });
  }
}