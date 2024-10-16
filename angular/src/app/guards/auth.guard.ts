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
  
        // Allow access to specific routes without authentication
        const publicRoutes = ['/email-verify'];
        const isPublicRoute = publicRoutes.some((publicRoute) =>
          state.url.startsWith(publicRoute)
        );
  
        if (isPublicRoute) {
          return true; // Allow access without authentication
        }
        // If the user is not logged in or the token is invalid/expired
        if (!loggedIn || !token || this.jwtHelper.isTokenExpired(token)) {
          this.auth.setIsLoggedIn(false);
          this.router.navigate(['signin']);
          return false;
        }
  
        // If no role is assigned, redirect to role selection
        if (!selectedRole) {
          this.router.navigate(['role']);
          return false;
        }
  
        // Engineer-specific route handling
        if (selectedRole === 'engineer') {
          const allowedEngineerRoutes = [
            '/engineers/form',
            '/engineers/update',
            '/engineers/details',
          ];
  
          const isAllowedRoute = allowedEngineerRoutes.some((routePrefix) =>
            state.url.startsWith(routePrefix)
          );
  
          if (!isAllowedRoute) {
            const engineerId = this.auth.getUserId();
            this.router.navigate(['/engineers/update', engineerId]);
            return false;
          }
        }
  
        return true; // Allow access
      })
    );
  }
  
}
