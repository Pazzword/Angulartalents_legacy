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
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private route: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth.getMyProfile().pipe(
      tap((profile: any) => {
        if (profile.type === route.data['role']) {
          // Allow access if the role matches the expected role.
          console.log(`Access granted for role: ${profile.type}`);
          return true;
        }

        if (profile.type === 'recruiter') {
          console.log('Redirecting recruiter to business update.');
          this.route.navigate(['business/update', profile.user.ID]);
          return false;
        }

        if (profile.type === 'engineer') {
          console.log('Redirecting engineer to engineer update.');
          this.route.navigate(['engineers/update', profile.user.ID]);
          return false;
        }

        return false;
      }),
      catchError((err) => {
        console.error('Error in RoleGuard:', err);
        return of(true); // Allow access on error.
      })
    );
  }
}

