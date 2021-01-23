import { TestBed } from '@angular/core/testing';

import { WorksorderService } from './worksorder.service';

describe('WorksorderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorksorderService = TestBed.get(WorksorderService);
    expect(service).toBeTruthy();
  });
});
