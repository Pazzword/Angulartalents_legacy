import { TestBed } from '@angular/core/testing';

import { EngineerService } from './engineer.service';

describe('EngineerService', () => {
  let service: EngineerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EngineerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
