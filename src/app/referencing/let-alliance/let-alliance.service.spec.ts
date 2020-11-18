import { TestBed } from '@angular/core/testing';

import { LetAllianceService } from './let-alliance.service';

describe('LetAllianceService', () => {
  let service: LetAllianceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LetAllianceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
