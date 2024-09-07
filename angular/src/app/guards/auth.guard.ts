import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; 
import { AuthService } from '../services/auth.service';
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private jwtHelper: JwtHelperService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.isLoggedIn$.pipe(
      tap((loggedIn: boolean) => {
        const token = localStorage.getItem('token');
        const selectedRole = localStorage.getItem('selectedRole');
        
        console.log('AuthGuard - token:', token); // Log token
        console.log('AuthGuard - selectedRole:', selectedRole); // Log role
        console.log('AuthGuard - isLoggedIn:', loggedIn); // Log logged-in status
        
        if (!loggedIn || this.jwtHelper.isTokenExpired(token)) {
          console.log('AuthGuard - Token is expired or user not logged in, redirecting to signin');
          this.auth.setIsLoggedIn(false);
          this.router.navigate(['signin']);
          
        } else {
          console.log('AuthGuard - User is authenticated, continuing');
        }
      })
    );
  }
}
