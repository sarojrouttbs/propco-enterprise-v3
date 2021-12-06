import { TestBed } from '@angular/core/testing';

import { NegotiateService } from './negotiate.service';

describe('NegotiateService', () => {
  let service: NegotiateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NegotiateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
