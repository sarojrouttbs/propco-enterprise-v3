import { TestBed } from '@angular/core/testing';

import { IsLoginGuardGuard } from './is-login-guard.guard';

describe('IsLoginGuardGuard', () => {
  let guard: IsLoginGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IsLoginGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
