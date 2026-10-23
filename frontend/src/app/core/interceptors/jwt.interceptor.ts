import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const user = authService.currentUser;

  let headers = req.headers;
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  if (user) {
    headers = headers.set('X-Auth-Username', user.username);
    if (user.payrollNo) {
      headers = headers.set('X-Auth-PayrollNo', user.payrollNo);
    }
  }

  const authReq = req.clone({ headers });
  return next(authReq);
};
