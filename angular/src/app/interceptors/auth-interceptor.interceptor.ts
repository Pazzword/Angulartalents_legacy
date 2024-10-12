import { Injectable, Injector } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const idToken = localStorage.getItem("token");

    // Exclude Cloudinary requests from adding the Authorization header
    if (req.url.includes('api.cloudinary.com')) {
      return next.handle(req);
    }

    if (idToken) {
      const cloned = req.clone({
        headers: req.headers.set("Authorization", `Bearer ${idToken}`)
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
