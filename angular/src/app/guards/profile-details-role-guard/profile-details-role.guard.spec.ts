import { TestBed } from '@angular/core/testing';

import { ProfileDetailsRoleGuard } from './profile-details-role.guard';

describe('ProfileDetailsRoleGuard', () => {
  let guard: ProfileDetailsRoleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ProfileDetailsRoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
