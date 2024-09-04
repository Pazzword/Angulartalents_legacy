import { TestBed } from '@angular/core/testing';

import { RolePageGuard } from './role-page.guard';

describe('RolePageGuard', () => {
  let guard: RolePageGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RolePageGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
