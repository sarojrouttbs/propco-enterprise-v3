import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-worldpay',
  templateUrl: './worldpay.page.html',
  styleUrls: ['./worldpay.page.scss'],
})
export class WorldpayPage implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    let snapshot = this.route.snapshot.queryParams;
    window.localStorage.setItem('worldpay_response', JSON.stringify(snapshot));
    parent.document.getElementById('worldpayResponse').click();
  }

}
