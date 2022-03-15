import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agent-header',
  templateUrl: './agent-header.component.html',
  styleUrls: ['./agent-header.component.scss'],
})
export class AgentHeaderComponent implements OnInit {
  entityControl = new FormControl(['Property']);
  constructor(private router: Router) { }

  ngOnInit() {}

  searchHandler(term) {
    // console.log('dsadsad')
  }

  goToHome() {
    this.router.navigate(['/', 'agent']);
  }
  goToWorkSpace() {
    this.router.navigate(['agent/entity/property/dashboard']);
  }

}
