import { OnInit, Component, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-accordion-list',
  templateUrl: './accordion-list.component.html',
  styleUrls: ['./accordion-list.component.scss'],
})
export class AccordionListComponent implements OnInit {

  @ViewChild('wrapper', { read: ElementRef }) wrapper;
  @Input('expanded') expanded;
  @Input('height') height;

  constructor() {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    
  }

}
