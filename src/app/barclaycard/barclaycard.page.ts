import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-barclaycard',
  templateUrl: './barclaycard.page.html',
  styleUrls: ['./barclaycard.page.scss'],
})
export class BarclaycardPage implements OnInit {

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    let snapshot = this.route.snapshot.queryParams;
    console.log(JSON.stringify(snapshot));
    window.localStorage.setItem('barclaycard_response', JSON.stringify(snapshot));
    parent.document.getElementById('barclaycardResponse').click();
  }

}
