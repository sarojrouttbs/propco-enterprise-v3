import { Component, Input } from '@angular/core';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-tob-property-details',
  templateUrl: './tob-property-details.component.html',
  styleUrls: ['./tob-property-details.component.scss'],
})

export class TobPropertyDetailsComponent {
  @Input() propertyDetails;
  @Input() rentFrequencyTypes;
  @Input() isTobPropertyCardReady;
  constructor(public commonService: CommonService) { }
}
