import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileDetailsRoleGuard implements CanActivate {
  constructor(private auth: AuthService, private route: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.getMyProfile().pipe(
      tap((profile: any) => {
        // Log role details for debugging
        console.log(`Guard check - Role from profile: ${profile.type}, Expected role: ${route.data['role']}`);

        // Allow access if the user role matches the expected role
        if (profile.type === route.data['role']) {
          console.log('Role matches. Access granted.');
          return true;
        }

        // Specific access for recruiters
        if (profile.type === 'recruiter') {
          console.log('Recruiter role found. Access granted.');
          return true; // Allow access for recruiters
        }

        // For other users, deny access
        console.log('Access denied. Redirecting to home.');
        this.route.navigate(['/']);
        return false;
      }),
      catchError((err) => {
        console.error('Error occurred in guard:', err);  // Improved error logging
        this.route.navigate(['/']);
        return of(false);
      })
    );
  }
}
