import { TestBed } from '@angular/core/testing';

import { UpdateProfileRoleGuard } from './update-profile-role.guard';

describe('UpdateProfileRoleGuard', () => {
  let guard: UpdateProfileRoleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UpdateProfileRoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
