import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SolrService } from 'src/app/solr/solr.service';

declare function openScreen(key: string, value: any): any;
@Component({
  selector: 'app-solr-header',
  templateUrl: './solr-header.component.html',
  styleUrls: ['./solr-header.component.scss'],
})
export class SolrHeaderComponent {
  entityControl = new FormControl(['Property']);
  constructor(private solrService: SolrService) {
  }
 
  searchHandler(term) {
  }

  openHomeCategory(key: string, value = null) {
    openScreen(key, value);
  }

  private updateUserDetail(body) {
    return new Promise((resolve) => {
      this.solrService.updateUserDetails(body).subscribe(
        (res) => {
          if (res) {
            resolve(true);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  async setDefaultHome(enableNewHomeScreen: boolean) {
    await this.updateUserDetail({ enableNewHomeScreen });
  }

}
