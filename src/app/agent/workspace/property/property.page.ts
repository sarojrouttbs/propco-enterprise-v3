import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as menuList from '../../../../assets/data/menu.json';
import { HostListener } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-property',
  templateUrl: './property.page.html',
  styleUrls: ['./property.page.scss'],
})
export class PropertyPage implements OnInit {
  @HostListener('window:resize', ['$event'])

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
  showMenu = true;
  label = 'Dashboard';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private common: CommonService
  ) {
    this.getPageWidthHeight();
  }

  ngOnInit() {
    this.menuItems = menuList.agents;
    this.proptertyId = this.route.snapshot.params['propertyId'];
    this.getMenutoggleFlag();
  }
  
  toggleMenu(){
    this.showMenu  = !this.showMenu 
  }

  getPageWidthHeight() {
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


  setLabel(name){
    this.label = name;
  }

}
