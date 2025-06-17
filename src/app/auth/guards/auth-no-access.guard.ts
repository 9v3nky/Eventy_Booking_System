import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authNoAccessGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    return true;
  } else {
    router.navigate(['/dashboard']);
    return false;
  }
};