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
          this.route.navigate(['/']); // Redirect to home if role does not match
          return false;
        }
        if (profile.type === 'recruiter') {
          this.route.navigate(['business/update', profile.user.ID]); // Redirect to business update
          return false;
        }
        if (profile.type === 'engineer') {
          this.route.navigate(['engineers/update', profile.user.ID]); // Redirect to engineer update
          return false;
        } else {
          return true; // Allow access if no specific role is required
        }
      }),
      catchError((err) => {
        return of(true); // Allow access on error, can adjust based on specific needs
      })
    );
  }
}
