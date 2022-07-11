import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-select-all-plus-search',
  templateUrl: './select-all-plus-search.component.html',
  styleUrls: ['./select-all-plus-search.component.scss'],
})
export class SelectAllPlusSearchComponent implements OnInit {

  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() searchText = '';
  @Output() readonly selectAllChange = new EventEmitter();
  @Output() readonly searchChange = new EventEmitter();

  constructor() { }

  ngOnInit() { }

}
