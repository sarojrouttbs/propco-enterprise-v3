import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-let-board',
  templateUrl: './let-board.component.html',
  styleUrls: ['./let-board.component.scss'],
})
export class LetBoardComponent implements OnInit {
  @Input() group;
  constructor() { }

  ngOnInit() {}

}
