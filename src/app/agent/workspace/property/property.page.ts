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

  // fillerNav = Array.from({ length: 50 }, (_, i) => `Nav Item ${i + 1}`);

  fillerContent = Array.from({ length: 50 }, () =>
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
       labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
       laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
       voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
       cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`);
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;
  // private _mobileQueryListener: () => void;


  constructor(private menu: MenuController, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher, private router: Router) {
    setTimeout(() => {
      this.open = true;
    }, 200);
    // this.mobileQuery = media.matchMedia('(max-width: 600px)');
    // this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    // this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnInit() {
  }

  // ngOnDestroy(): void {
  //   this.mobileQuery.removeListener(this._mobileQueryListener);
  // }

  // shouldRun = [/(^|\.)plnkr\.co$/, /(^|\.)stackblitz\.io$/].some(h => h.test(window.location.host));

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
        this.router.navigate(['agent/workspace/property/438d2a62-aca0-11ea-8ddb-02420aff051f/dashboard']);
        break;
      case 'details':
        this.router.navigate(['agent/workspace/property/438d2a62-aca0-11ea-8ddb-02420aff051f/details']);
        break;
      default:
        break;
    }
  }

}
