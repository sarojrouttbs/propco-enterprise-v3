import { MediaMatcher } from "@angular/cdk/layout";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MenuController } from "@ionic/angular";

@Component({
  selector: "app-property",
  templateUrl: "./property.page.html",
  styleUrls: ["./property.page.scss"],
})
export class PropertyPage implements OnInit {
  showFiller = false;
  open = false;
  mobileQuery: MediaQueryList;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;
  proptertyId:string;


  constructor(private menu: MenuController, private router: Router,private route:ActivatedRoute) {
    setTimeout(() => {
      this.open = true;
    }, 200);
  }

  ngOnInit() {
    this.proptertyId = this.route.snapshot.params['pid'];
  }

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  changePage(pageName) {
    switch (pageName) {
      case 'dashboard':
        this.router.navigate([`agent/workspace/property/${this.proptertyId}/dashboard`]);
        break;
      case 'details':
        this.router.navigate([`agent/workspace/property/${this.proptertyId}/details`]);
        break;
      default:
        break;
    }
  }

}
