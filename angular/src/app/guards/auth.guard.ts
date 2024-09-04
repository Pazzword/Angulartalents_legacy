import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // Import tap here
import { AuthService } from '../services/auth.service';
import { JwtHelperService } from "@auth0/angular-jwt"; // Import JWT Helper

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
        if (!loggedIn || this.jwtHelper.isTokenExpired(token)) {
          this.router.navigate(['signin']);
          this.auth.setIsLoggedIn(false);
        }
      })
    );
  }
}
