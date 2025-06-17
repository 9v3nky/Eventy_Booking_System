import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authNoAccessGuard } from './auth-no-access.guard';

describe('authNoAccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authNoAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
