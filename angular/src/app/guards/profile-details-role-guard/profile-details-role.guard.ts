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
        if (profile.type === route.data['role']) {
          this.route.navigate(['/']); // Navigate to home if access is not granted
          return false;
        }
        if (profile.type === 'recruiter') {
          return true; // Allow access for recruiters
        } else {
          return false; // Deny access for others
        }
      }),
      catchError((err) => {
        console.log(err.error.code);
        this.route.navigate(['/']); // Redirect to home on error
        return of(false);
      })
    );
  }
}
