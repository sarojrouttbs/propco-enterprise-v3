import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-accordion-list',
  templateUrl: './accordion-list.component.html',
  styleUrls: ['./accordion-list.component.scss'],
})
export class AccordionListComponent {

  @ViewChild('wrapper', { read: ElementRef }) wrapper;
  @Input('expanded') expanded;
  @Input('height') height;
}
