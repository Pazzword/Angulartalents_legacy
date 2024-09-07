import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environments';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private auth: AuthService){}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const idToken = localStorage.getItem("token");
        const selectedRole = localStorage.getItem('selectedRole');  // Log the selectedRole
        console.log('AuthInterceptor - idToken:', idToken);
        console.log('AuthInterceptor - selectedRole:', selectedRole);
        
        if (req.url === "https://api.cloudinary.com/v1_1/rmsmms/upload") {
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

    // this is a second option
    // shouldAddTheAuthorizationHeader(request: { url: string; }){
    //   const localHostUrl = environment.apiUrl;
    //   if(
    //     (request.url === `${localHostUrl}/me`) ||
    //     (request.url === `${localHostUrl}/engineers/me`) ||
    //     (request.url === `${localHostUrl}/engineers`) ||
    //     (request.url === `${localHostUrl}/recruiters/me`) ||
    //     (request.url === `${localHostUrl}/recruiters`)
    //     // || (request.url.includes("page"))
    //     ){
    //     return true
    //   }else{
    //     return false
    //   }
    // }
  
