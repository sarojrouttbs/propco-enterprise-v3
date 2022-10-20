import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AgentService } from 'src/app/agent/agent.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class ParticularsService {

  private unsubscribe = new Subject<void>();
  formStatus: FormStatus.Saving | FormStatus.Saved | FormStatus.Idle = FormStatus.Idle;
  formChangedValue: any;

  constructor(
    private commonService: CommonService,
    private agentService: AgentService
  ) { }
  updateDetails(formName: any, entityId: any) {
    formName.valueChanges.pipe(
      debounceTime(1000),
      tap(() => {
        this.formStatus = FormStatus.Saving;
        this.commonService.showAutoSaveLoader(this.formStatus);
        const changedData = this.commonService.getDirtyValues(formName)
        const controlName = Object.keys(changedData);
        
        if (controlName instanceof Array) {
          if(controlName.indexOf('availableFromDate') != -1){
            let updatedValue = this.commonService.getFormatedDate(changedData?.availableFromDate);
            changedData.availableFromDate = updatedValue;
          }
          if(controlName.indexOf('availableToDate') != -1){
            let updatedValue = this.commonService.getFormatedDate(changedData?.availableToDate);
            changedData.availableToDate = updatedValue;
          }
          if(controlName.indexOf('fullPublishedDescription') != -1){
            changedData.fullDescription = changedData.fullPublishedDescription;
            delete changedData.fullPublishedDescription;
          }
        }
        this.formChangedValue = changedData ?? {};

      }),
      switchMap((value) => {
        if (Object.keys(this.formChangedValue).length > 0) {
          return this.agentService.updatePropertyDetails(entityId, this.formChangedValue);
        }
      }),
      takeUntil(this.unsubscribe)
    ).subscribe(async (value) => {
      formName.markAsPristine();
      formName.markAsUntouched();
      this.formStatus = FormStatus.Saved;
      this.commonService.showAutoSaveLoader(this.formStatus);
      await this.sleep(2000);
      if (this.formStatus === FormStatus.Saved) {
        this.formStatus = FormStatus.Idle;
        this.commonService.showAutoSaveLoader(this.formStatus);
      }
    }, (error) => {
      formName.markAsPristine();
      formName.markAsUntouched();
      this.formStatus = FormStatus.Idle;
      this.commonService.showAutoSaveLoader(this.formStatus);
      this.updateDetails(formName, entityId);
    }
    );
  }
  sleep(ms: number): Promise<any> {
    return new Promise((res) => setTimeout(res, ms));
  }
}

enum FormStatus {
  Saving = 'Saving...',
  Saved = 'Saved!',
  Idle = '',
}