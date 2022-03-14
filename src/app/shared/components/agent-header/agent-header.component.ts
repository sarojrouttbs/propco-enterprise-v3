import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-agent-header',
  templateUrl: './agent-header.component.html',
  styleUrls: ['./agent-header.component.scss'],
})
export class AgentHeaderComponent implements OnInit {
  entityControl = new FormControl(['Property']);
  constructor() { }

  ngOnInit() {}

  searchHandler(term) {
  }

}
