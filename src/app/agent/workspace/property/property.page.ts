import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  screenWidth;
  showMenu = false;
  label = 'Dashboard';
  mode: string = 'side';
  constructor(
    private route: ActivatedRoute,
  ) {
    this.getPageWidthHeight();
  }

  ngOnInit() {
    this.menuItems = menuList.agents;
    this.proptertyId = this.route.snapshot.params['propertyId'];
    if (this.screenWidth > 1024) {
      setTimeout(() => {
        /** added timeout to open sidenav, On page load we will see a better way to do it */
        this.showMenu = true;
      }), 50;
    } else {
      this.mode = 'over';
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  getPageWidthHeight() {
    this.screenWidth = window.innerWidth;
  }

  setLabel(name: string) {
    this.label = name;
  }

  onResize(event) {
    this.screenWidth = event.target.innerWidth;
    if (this.screenWidth > 1024) {
      this.mode = 'side';
      this.showMenu = true;
    } else {
      this.mode = 'over';
      this.showMenu = false;
    }
  }
}

