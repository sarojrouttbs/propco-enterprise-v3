import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { FaultsService } from 'src/app/faults/faults.service';

@Component({
  selector: 'app-contact-details-modal',
  templateUrl: './contact-details-modal.page.html',
  styleUrls: ['./contact-details-modal.page.scss'],
})
export class ContactDetailsModalPage implements OnInit {
  landlordDetails;
  tenantId;
  landlordDetForm: FormGroup;
  tenantDetForm: FormGroup;
  tenantDetails;

  constructor(
    public modalController: ModalController,
    private fb: FormBuilder,
    private faultsService: FaultsService
  ) { }

  ngOnInit() {
    this.getTenantDetail()
    this.initLandlordForm();
    this.initTenantForm();
  }

  initLandlordForm() {
    this.landlordDetForm = this.fb.group({
      name: [],
      email: [],
      alternateEmail: [],
      emergencyNumber: [],
      daytime: [],
      mobile: [],
      evening: [],
      telephone: []
    });
  }

  initTenantForm() {
    this.tenantDetForm = this.fb.group({
      name: [],
      email: [],
      alternateEmail: [],
      emergencyNumber: [],
      daytime: [],
      mobile: [],
      evening: [],
      telephone: []
    });
  }

  private getTenantDetail() {
    if (this.tenantId) {
      this.faultsService.getTenantDetails(this.tenantId).subscribe((res) => {
        this.tenantDetails = res ? res : '';
      }, error => {
      });
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
