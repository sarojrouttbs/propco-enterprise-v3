import { TestBed } from '@angular/core/testing';

import { HmrcService } from './hmrc.service';

describe('HmrcService', () => {
  let service: HmrcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HmrcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
