import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-property-right-panel',
  templateUrl: './property-right-panel.component.html',
  styleUrls: ['./property-right-panel.component.scss'],
})
export class PropertyRightPanelComponent implements OnInit {

  @Input() propertyData;
  constructor() { }

  ngOnInit() {}

}
