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
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
  }

  redirect(type: string) {
    switch (type) {
      case 'let-alliance':
        this.router.navigate([`../let-alliance`], { relativeTo: this.route });
        break;
      case 'maintenance':
        this.router.navigate([`../maintenance`], { relativeTo: this.route });
        break;
      case 'market-appraisal':
        this.router.navigate([`../market-appraisal`], { relativeTo: this.route });
        break;

      default:
        break;
    }
  }
}
