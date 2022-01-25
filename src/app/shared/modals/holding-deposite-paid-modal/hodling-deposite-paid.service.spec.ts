import { TestBed } from '@angular/core/testing';

import { HodlingDepositePaidService } from './hodling-deposite-paid.service';

describe('HodlingDepositePaidService', () => {
  let service: HodlingDepositePaidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HodlingDepositePaidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
