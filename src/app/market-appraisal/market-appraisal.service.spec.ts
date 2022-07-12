import { TestBed } from '@angular/core/testing';

import { MarketAppraisalService } from './market-appraisal.service';

describe('MarketAppraisalService', () => {
  let service: MarketAppraisalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarketAppraisalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
