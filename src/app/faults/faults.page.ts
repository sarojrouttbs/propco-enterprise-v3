import { Component, OnInit } from '@angular/core';
import { ScriptService } from '../shared/services/script.service';
@Component({
  selector: 'app-faults',
  templateUrl: './faults.page.html',
  styleUrls: ['./faults.page.scss'],
})
export class FaultsPage implements OnInit {
  
  constructor(scriptService: ScriptService) {
    scriptService.load('jiraJquery', 'jiraIssueCollector');
  }

  ngOnInit() {
  }

}
