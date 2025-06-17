import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminAuthGuardGuard: CanActivateFn = () => {
  const router = inject(Router);
  const admin = localStorage.getItem('isAdmin');

  if (admin == 'true') {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};