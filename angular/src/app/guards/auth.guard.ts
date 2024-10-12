import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  CanActivate, 
  Router, 
  RouterStateSnapshot 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.auth.isLoggedIn$.pipe(
      map((loggedIn: boolean) => {
        const token = localStorage.getItem('token');
        const selectedRole = this.auth.getRole();

        console.log('AuthGuard - token:', token);
        console.log('AuthGuard - selectedRole:', selectedRole);
        console.log('AuthGuard - isLoggedIn:', loggedIn);

        // If the user is not logged in or the token is invalid/expired
        if (!loggedIn || !token || this.jwtHelper.isTokenExpired(token)) {
          console.log(
            'AuthGuard - Token is expired or user not logged in, redirecting to signin'
          );
          this.auth.setIsLoggedIn(false);
          this.router.navigate(['signin']);
          return false;
        }

        // If no role is assigned, redirect to role selection
        if (!selectedRole) {
          console.log('AuthGuard - No role assigned, redirecting to role selection');
          this.router.navigate(['role']);
          return false;
        }

        // Allow engineers to access certain routes
        if (selectedRole === 'engineer') {
          // Define allowed engineer routes
          const allowedEngineerRoutes = [
            '/engineers/form',
            '/engineers/update',
            '/engineers/details',
          ];

          // Check if the current URL starts with any allowed route
          const isAllowedRoute = allowedEngineerRoutes.some((routePrefix) =>
            state.url.startsWith(routePrefix)
          );

          if (!isAllowedRoute) {
            console.log(
              'AuthGuard - Engineer role detected, navigating to engineer update page'
            );
            const engineerId = this.auth.getUserId(); // Get the engineer's ID
            this.router.navigate(['/engineers/update', engineerId]);
            return false;
          }
        }

        // For recruiters, you might have similar logic if needed
        // ...

        return true; // Allow access
      })
    );
  }
}
