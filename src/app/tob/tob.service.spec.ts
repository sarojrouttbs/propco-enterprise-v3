import { TestBed } from '@angular/core/testing';

import { TobService } from './tob.service';

describe('TobService', () => {
  let service: TobService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
