import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ThemeService } from '../../services/theme.service';
declare function openScreen(key: string, value: any): any;
@Component({
  selector: 'app-solr-header',
  templateUrl: './solr-header.component.html',
  styleUrls: ['./solr-header.component.scss'],
})
export class SolrHeaderComponent implements OnInit {
  entityControl = new FormControl(['Property']);
  constructor(private theme: ThemeService) {
    this.theme.activeTheme('light-theme');
  }

  ngOnInit() {}

  searchHandler(term) {
  }

  openHomeCategory(key: string, value = null) {
    openScreen(key, value);
  }
}
