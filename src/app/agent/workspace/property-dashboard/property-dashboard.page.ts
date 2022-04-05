import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-property-dashboard",
  templateUrl: "./property-dashboard.page.html",
  styleUrls: ["./property-dashboard.page.scss"],
})
export class PropertyDashboardPage implements OnInit {
  showFiller = false;
  constructor() {
  }

  ngOnInit() {
    console.log('side-nav')
  }
}
