import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  formStatus: any = '';
  constructor(private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.isAutosaveLoader$.subscribe((data)=>{
      this.formStatus = data;
    });
  }

}
