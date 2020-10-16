import { Component, OnInit } from '@angular/core';
import { catList, propertyData } from './cat.json';

@Component({
  selector: 'fault-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  catList: any[] = catList;
  propertyData = propertyData;
  pageNo = 1;

  categoryIconList = [
    'assets/images/fault-categories/alarms-and-smoke-detectors.svg',
    'assets/images/fault-categories/bathroom.svg',
    'assets/images/fault-categories/electricity.svg',
    'assets/images/fault-categories/fire.svg',
    'assets/images/fault-categories/floors-walls-and-ceilings .svg',
    'assets/images/fault-categories/garden.svg',
    'assets/images/fault-categories/hot-water.svg',
    'assets/images/fault-categories/kitchen.svg',
    'assets/images/fault-categories/lighting.svg',
    'assets/images/fault-categories/others.svg',
    'assets/images/fault-categories/smell-oil-or-gas.svg',
    'assets/images/fault-categories/toilet.svg',
    'assets/images/fault-categories/water-and-leaks.svg'
  ];



  constructor() { }

  ngOnInit() {
    this.catList.map((cat, index) => {
      cat.imgPath = this.categoryIconList[index];
    });
  }

  goToPriorityPage(pageNo){
    this.pageNo = pageNo;
  }



}
