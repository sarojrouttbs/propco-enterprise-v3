import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import * as menuList from '../../../../assets/data/menu.json';

@Component({
  selector: 'app-property',
  templateUrl: './property.page.html',
  styleUrls: ['./property.page.scss'],
})
export class PropertyPage implements OnInit {
  showFiller = false;
  open = false;
  mobileQuery: MediaQueryList;
  isExpanded = true;
  showSubmenu = false;
  isShowing = false;
  showSubSubMenu = false;
  proptertyId: string;
  menuItems;

  constructor(
    private menu: MenuController,
    private router: Router,
    private route: ActivatedRoute
  ) {
    setTimeout(() => {
      this.open = true;
    }, 200);
  }

  ngOnInit() {
    this.menuItems = menuList.agents;
    this.proptertyId = this.route.snapshot.params['propertyId'];
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
      case 'dashboard':
        this.router.navigate([
          `agent/workspace/property/${this.proptertyId}/dashboard`,
        ]);
        break;
      case 'details':
        this.router.navigate([
          `agent/workspace/property/${this.proptertyId}/details`,
        ]);
        break;

      default:
        break;
    }
  }
}
