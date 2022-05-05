import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  redirect(type){
    switch (type) {
      case 'let-alliance':
        this.router.navigate([`agent/let-alliance`]);
        break;
      default:
        break;
    }
  }
}
