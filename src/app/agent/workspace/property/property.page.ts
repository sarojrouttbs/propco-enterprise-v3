import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MenuController } from "@ionic/angular";
import * as menuList from "../../../../assets/data/menu.json";
import { HostListener } from "@angular/core";
import { CommonService } from "src/app/shared/services/common.service";
import { async } from '@angular/core/testing';

@Component({
  selector: "app-property",
  templateUrl: "./property.page.html",
  styleUrls: ["./property.page.scss"],
})
export class PropertyPage implements OnInit {
  @HostListener("window:resize", ["$event"])

  showFiller = false;
  open = false;
  mobileQuery: MediaQueryList;
  isExpanded = true;
  showSubmenu = false;
  isShowing = false;
  showSubSubMenu = false;
  proptertyId: string;
  menuItems;
  screenHeight;
  screenWidth;
  showMenu = false;
  constructor(
    private menu: MenuController,
    private router: Router,
    private route: ActivatedRoute,
    private common: CommonService
  ) {
    setTimeout(() => {
      this.open = true;
    }, 2000);
    this.onResize();
  }

 async ngOnInit() {
    this.menuItems = menuList.agents;
    this.proptertyId = this.route.snapshot.params["propertyId"];
   await this.getMenutoggleFlag();
  }
  

  onResize(event?) {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
  }

  getMenutoggleFlag() {
    this.common.toggleMenuChange.subscribe((data: any) => {
      this.showMenu = data;
    });
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

  changePage(pageName, item, submenu) {
    this.menuItems.forEach((element) => {
      element.isActive = false;
      if (element.subMenu.length) {
        element.subMenu.forEach((element) => {
          element.isActive = false;
        });
      }
    });

    if (item && submenu) {
      submenu.isActive = true;
      item.isActive = true;
    }

    if (item && !submenu) {
      item.isActive = true;
    }

    switch (pageName) {
      case "dashboard":
        this.router.navigate([
          `agent/workspace/property/${this.proptertyId}/dashboard`,
        ]);
        break;
      case "details":
        this.router.navigate([
          `agent/workspace/property/${this.proptertyId}/details`,
        ]);
        break;
      case "applications":
        this.router.navigate([
          `agent/workspace/property/${this.proptertyId}/${pageName}`,
        ]);
        break;

      default:
        break;
    }
  }
}
