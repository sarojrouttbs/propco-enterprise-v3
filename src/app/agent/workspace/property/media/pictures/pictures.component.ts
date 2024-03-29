import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IonSlides } from '@ionic/angular';
import { AgentService } from 'src/app/agent/agent.service';
import { AGENT_WORKSPACE_CONFIGS, SYSTEM_OPTIONS } from 'src/app/shared/constants';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-pictures',
  templateUrl: './pictures.component.html',
  styleUrls: ['./pictures.component.scss'],
})
export class PicturesComponent implements OnInit {
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;  
  isExpanded = false;
  mediaForm: FormGroup;
  localStorageItems: any;
  selectedEntryDetails: any;
  propertyDetails: any;
  options: any;
  isImageSelected = false;
  selectedMediaDetails: any
  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private agentService: AgentService
  ) { }

  ngOnInit() {
    this.initForm();
    this.initApi();
  }
  private async initApi() {
    this.localStorageItems = this.fetchItems();
    this.selectedEntryDetails = await this.getActiveTabEntityInfo();
    this.getPropertyDetails();
    this.getOptions();
  }
  private getOptions() {
    const params = new HttpParams()
      .set('hideLoader', 'true')
      .set('option', SYSTEM_OPTIONS.WEB_IMAGE_URL);
    return new Promise((resolve) => {
      this.agentService.getSyatemOptions(params).subscribe(
        (res) => {
          this.options = res ? res.WEB_IMAGE_URL : '';
          resolve(true);
        },
        (error) => {
          resolve(false);
        }
      );
    });
  }
  private getPropertyDetails() {
    const params = new HttpParams().set('hideLoader', 'true');
    return new Promise((resolve, reject) => {
      this.agentService.getPropertyDetails(this.selectedEntryDetails.entityId, params).subscribe(result => {
        if (result && result.data) {
          this.propertyDetails = result.data;
        }
        resolve(result.data.media);
      }, error => {
        reject(error);
      })
    })
  }

  private getActiveTabEntityInfo(): any {
    const item = this.localStorageItems.filter((x) => x.isSelected);
    if (item) {
      return item[0];
    }
  }
  fetchItems(): any {
    return (
      this.commonService.getItem(
        AGENT_WORKSPACE_CONFIGS.localStorageName,
        true
      ) || []
    );
  }
  private initForm() {
    this.mediaForm = this.formBuilder.group({
      label: [''],
      fileName: [''],
      description: [''],
      isInternal: [false],
      imageIndex: [''],
      isEpc: [false],
      isFloorPlan: [false],
      isPublishOnLettingList: [false],
      isPublishOnWindowCards: [false],
      isPublishOnParticulars: [false],
      isPublishOnCarousel: [false],
      isPublishOnInternet: [false]
    })
  }

   getImageDetails(mediaId: any) {
    this.selectedMediaDetails = this.propertyDetails.media.filter(item => item.mediaId == mediaId);
    this.mediaForm.patchValue(this.selectedMediaDetails[0]);
    this.isImageSelected = true;
  }
   expandView() {
    this.isExpanded = true;
  }

   next() {
    this.slides.slideNext();
  }

   prev() {
    this.slides.slidePrev();
  }

   removeMediaImage(selectedItem: any) {
    this.commonService.showConfirm('Media', 'Are you sure, you want to remove this image?', '', 'YES', 'NO').then(response => {
      if (response) {
        const index = this.propertyDetails.value.indexOf(selectedItem);
        if (index !== -1) {
          this.propertyDetails.value.splice(index, 1);
        }
        this.propertyDetails.reset();
        this.propertyDetails.setValue(this.propertyDetails.value);
        if(this.selectedMediaDetails.mediaId === selectedItem.mediaId)
          this.selectedMediaDetails = '';
      }
    });
  }

  activeInactiveChip(key: string, value: boolean){
    this.mediaForm.controls[key].setValue(!value);
  }


}
