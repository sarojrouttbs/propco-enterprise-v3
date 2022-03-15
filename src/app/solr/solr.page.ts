import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

@Component({
  selector: "app-solr",
  templateUrl: "./solr.page.html",
  styleUrls: ["./solr.page.scss"],
})
export class SolrPage implements OnInit {
  visibility: boolean = false;
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('solr/dashboard')) {
          this.visibility= false;
        } else {
          this.visibility= true;
        }
      }
    });
  }
}
