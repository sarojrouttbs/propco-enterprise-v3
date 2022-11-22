import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SearchPropertyPage } from 'src/app/shared/modals/search-property/search-property.page';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  constructor(
    private modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.searchProperty();
  }

  private async searchProperty() {
    const modal = await this.modalController.create({
      component: SearchPropertyPage,
      cssClass: 'modal-container la-property-search la-modal-container',
      backdropDismiss: false,
      componentProps: {
        isFAF: false,
        pageName: 'application'
      }
    });

    modal.onDidDismiss().then(res => {
      if (res.data.propertyId) {
        let propertyId = res.data.propertyId;
        this.router.navigate([`/tob/${propertyId}/applications`], { relativeTo: this.route, queryParams: {
          pId: res.data.propertyId}}).then(() => {
            location.reload();
          });
      } else {
        //this.router.navigate(['../dashboard'], { replaceUrl: true, relativeTo: this.route });
      }
    });
    await modal.present();
  }

}
