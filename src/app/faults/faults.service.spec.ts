import { TestBed } from '@angular/core/testing';

import { FaultsService } from './faults.service';

describe('FaultsService', () => {
  let service: FaultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
