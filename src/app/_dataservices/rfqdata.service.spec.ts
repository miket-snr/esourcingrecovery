import { TestBed } from '@angular/core/testing';

import { RfqdataService } from './rfqdata.service';

describe('RfqdataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RfqdataService = TestBed.get(RfqdataService);
    expect(service).toBeTruthy();
  });
});
