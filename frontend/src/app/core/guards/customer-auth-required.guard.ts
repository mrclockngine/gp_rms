import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AlertService, CustomerAuthService, LoggerService } from '../services';

export const customerAuthRequiredGuard: () => CanActivateFn = () => () => {
  const authService = inject(CustomerAuthService);
  const logger = inject(LoggerService);
  const router = inject(Router);
  const alertService = inject(AlertService);

  if (!authService.auth) {
    logger.warn(
      'authRequiredGuard',
      'Customer is not authenticated, redirecting to login page'
    );
    alertService.error('You must be logged in to access this page.');

    router.navigateByUrl('/login');
    return false;
  }

  return true;
};
