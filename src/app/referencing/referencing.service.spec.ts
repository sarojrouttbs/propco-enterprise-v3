import { TestBed } from '@angular/core/testing';

import { ReferencingService } from './referencing.service';

describe('ReferencingService', () => {
  let service: ReferencingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferencingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
