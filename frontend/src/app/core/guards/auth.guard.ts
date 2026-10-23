import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  if (!token) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // 1. Mandatory password change check:
  // If mustChangePassword is true, restrict access ONLY to /change-password
  if (authService.mustChangePassword()) {
    if (state.url !== '/change-password') {
      router.navigate(['/change-password']);
      return false;
    }
    return true;
  }

  // If user does not need to change password but tries to navigate to /change-password
  // allow it so they can change password at will if desired.

  // 2. Administrative routes protection:
  // Only users with ROLE_ADMIN can access /admin/**
  if (state.url.startsWith('/admin')) {
    if (!authService.isAdmin()) {
      if (authService.isOrdinaryMember()) {
        router.navigate(['/my-account']);
      } else {
        router.navigate(['/dashboard']);
      }
      return false;
    }
    return true;
  }

  // 3. Ordinary Member restriction:
  // Ordinary members are restricted to self-service /my-account and /change-password
  if (authService.isOrdinaryMember()) {
    if (!state.url.startsWith('/my-account') && !state.url.startsWith('/change-password')) {
      router.navigate(['/my-account']);
      return false;
    }
  }

  return true;
};
