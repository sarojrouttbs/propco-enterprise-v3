import { Component, Input } from '@angular/core';
import { DATE_FORMAT } from 'src/app/shared/constants';

@Component({
  selector: 'app-let-board',
  templateUrl: './let-board.component.html',
  styleUrls: ['./let-board.component.scss'],
})
export class LetBoardComponent {
  DATE_FORMAT = DATE_FORMAT;
  @Input() group;
}
