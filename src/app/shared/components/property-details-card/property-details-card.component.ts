import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-property-details-card',
  templateUrl: './property-details-card.component.html',
  styleUrls: ['./property-details-card.component.scss'],
})
export class PropertyDetailsCardComponent implements OnInit {

  @Input() propertyData;

  constructor() { }

  ngOnInit() {
    
  }

}
