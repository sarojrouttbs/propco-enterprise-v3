import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-solr-header",
  templateUrl: "./solr-header.component.html",
  styleUrls: ["./solr-header.component.scss"],
})
export class SolrHeaderComponent implements OnInit {
  entityControl = new FormControl(["Property"]);
  constructor() {}

  ngOnInit() {}

  searchHandler(term) {
  }
}
