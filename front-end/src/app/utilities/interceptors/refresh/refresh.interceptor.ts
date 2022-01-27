import { AuthenticationService } from '../../services/authentication/authentication.service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log(this.authService.hasEnoughTimePassedSinceLastAttempt, this.authService.lastRefreshAttempt);
    if (
      this.authService.isAuthenticated() ||
      (request.url.includes('refresh') && this.authService.hasEnoughTimePassedSinceLastAttempt)
    )
      return next.handle(request);
    if (this.authService.hasValidRefreshToken()) {
      return this.authService.refresh().pipe(
        switchMap(() => {
          const clone = request.clone({
            setHeaders: {
              Authorization: `Bearer ${this.authService.accessToken}`,
            },
          });
          return next.handle(clone);
        })
      );
    }
    return next.handle(request);
  }
}
