import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { AuthenticateService } from '@app/_dataservices/authenticate.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticateService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.method === 'GET') {
      // add auth header with jwt if user is logged in and request is to api url
      const isApiUrl = request.url.startsWith(environment.BASE_API);
      if (isApiUrl) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer 123456`,
            apikey: `${environment.apikey}`,
            'Content-Type': 'application / json',
            Accept: 'application/json'
          }
        });
      }

      return next.handle(request);
    } else {
      return next.handle(request);
    }
  }
}
