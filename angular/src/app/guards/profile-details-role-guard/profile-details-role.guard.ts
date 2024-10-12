import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router, 
  RouterStateSnapshot,
} from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
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
      map((profile: any) => {
        // Check for undefined or null properties
        if (profile.user && profile.user.avatar) {
          console.log(`Avatar found: ${profile.user.avatar}`);
        } else {
          console.warn('Avatar is missing or undefined');
        }

        // Existing role checks
        console.log(
          `Guard check - Role from profile: ${profile.type}, Expected role: ${route.data['role']}`
        );

        if (profile.type === route.data['role']) {
          return true;
        }

        // Allow recruiters access
        if (profile.type === 'recruiter') {
          return true;
        }

        this.route.navigate(['/']);
        return false;
      }),
      catchError((err) => {
        console.error('Error occurred in guard:', err);
        this.route.navigate(['/']);
        return of(false);
      })
    );
  }
}
